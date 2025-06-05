// ==UserScript==
// @name         Logii 택배 자동 입력
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  Logii 택배 예약 시 자동 입력 및 체크박스 자동 체크
// @author       You
// @match        https://www.logii.com/Reservation/*
// @match        https://www.logii.com/LogiiPay/Secure_Keypad.pms?tp=1
// @match        https://m.logii.com/interface/keypad/interface/keypad.asp*
// @match        https://www.logii.com/Reservation/Reserve.pm?execution=e3s6
// @grant        GM_xmlhttpRequest
// @grant        GM_log
// @connect      logii.com
// @connect      m.logii.com
// @connect      *
// @run-at       document-end
// ==/UserScript==

(function () {

  const PASSWORD = '123456'; // 자동 입력할 패스워드

  // 현재 URL 확인
  const currentUrl = window.location.href;
  const numberTemplates = {
    '0': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAA7CAYAAADFJfKzAAAAAXNSR0IArs4c6QAAAc5JREFUaEPtmT1WQjEQhe/rpJQOGoUSSjagna5Dl6Cr0CXoOrTTBUAJJT8NdFJKhwfOUTx5yfsZMxNJhpKTMLn3u5n3EjIMh1sk8slUbKSklWykYKFklWwEDmiMI4BolaBklWwEDsjFuNHGvNfCWc60DZ4nY9x+8rspILaJt0EHF6Va1rgfTfFYOo4+gFesk6ZrwbyUGcVWJWoK5yPMJvaq3cdL64SUucVqgvOl/03MJNZF1YipM+Y8dHnENrvYdk5zVN9nI1x+GF/XGUvKyWESi9i77gAPptbNCtfjJV5zC27gqd/DjZn49QzZ1HTmb2oZxNZffD1z6IIZxNr3a1HTsTcz//vWv1hH07Hu129I1n3r/5nrXyyl4VDmENIsJLaEEiUNKrbYASVLSMhhCqXZaIyBwg5OICIU45KFH203pkSSEv1/QRYpvUEhqXdjoN6LfX1zCAneT/HfoAC4bimiPM+i6rWpowsD/k88bGR3P2yNcsX8Hdkd1E5VQreLe4jp3Bv/nMwT+Ufg9x6t2rQq7mvKMJZHD2UhEnNUrITLIWoo2RCuS9RUshIuh6ihZEO4LlFTyUq4HKKGkg3hukRNJSvhcogaSjaE6xI1vwD0b54YuZvMvAAAAABJRU5ErkJggg==',
    '1': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAA7CAYAAADFJfKzAAAAAXNSR0IArs4c6QAAAU5JREFUaEPtmD0SwWAQht90lHRJg5RRuoBCwTk4gltolZyDzgW0UvppopOSjtEY+ZPJhG8n69VGsvO8z+5+mVjYbu/4k59FWKWmaVapWNAszSpIgG2sQGIqAs3SrIIEhNq4jkXXw7j2luDtjNEuwPqHocrANl3cO40olk7YJja9Dvpxg/pgM0Cf4Kpg6w6Ono1W1kxqgZ26PcxiI5pgrjrs0OliZb+v3A+rtrqwKUdL3pGiEfZ09jGvecm21gV7w9LfYXIFUmdYDWx4gLW/vBpZJewg9NEOrolpVQb7eRsRtrozS7NaFxTN0uwrAS6ovBfqYtdFPsvwnGUbF2vTvH+zjfMSKnudM8uZLdtD0fs5s9/NM/m0v5rZX4eZ9XyRNiasgQRo1kDIIiVoViR2A0Vp1kDIIiVoViR2A0Vp1kDIIiVoViR2A0Vp1kDIIiUegltbGPBjE7oAAAAASUVORK5CYII=',
    '2': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAA7CAYAAADFJfKzAAAAAXNSR0IArs4c6QAAAd9JREFUaEPtmD1SQkEMgPM6KaWDRqGEkgtop+fQI+gp9Ah6Du30AFBCCdpAJ6V0OOqgMzub3c0jeftDqMO8fPmyedlXwXi8hQP5VQpbqGk1W6hYULNqtoAKaBsXINGKoGbVbAEVaK6N233Y9o7tJdus4HK6hGfhgorDXnSH8NQ5CsRYw+1kDveB0dQwQdgWPAwHcBXK+Zf5Bh5nU7j+pKL448Vgb/ojuEO61p+WjGEZWNf59JP+RqwXUM0/QqOD4kRgcaumMVer89sVgG3Dy6gHZ2atHRMXK87rYgLnjHL5YVtdeBt04MSAfV/N4HSJTB2k7dOHtSbumbBIgdKHDRoVRpAVlv8VxN/GNWDti0cWA4pKiwy0XF49FFz7JOZv4e+corYxtjc7JzelkkZsNFj0giB4A4oCGwM0Shujq6Sg0V03N2oWBRWYvLaj3RAsvvBLDaNIsDgo9zroG9TiZu2ty78d+UDFB1RKoLKwdW4/IXr2iBFqY2TfJSbKfaZFYPf72PZfkfRhkYs4UepPePKwtI/i7hIkD8vVwhmY5RlMO9/Jm61zNpv6j8g0bip56nMUllqxXOLVbC6mqHmqWWrFcolXs7mYouapZqkVyyVezeZiipqnmqVWLJf4gzL7BTnoSxj3ONikAAAAAElFTkSuQmCC',
    '3': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAA7CAYAAADFJfKzAAAAAXNSR0IArs4c6QAAAfdJREFUaEPtmDFSAkEQRf9mEkoGiUIIIRfQTM+hR9BT6BH0HJrpASCEEDSBTELJsKSkhGF6d9ba37O79qY7VT3v/+6enkkwHK7xT77EYGvqtDlbU2NhzpqzNVDA0rgGJnoRzFlztgYK6KVxo423XgsnB6ItcTua4l5BTD6sCOnQrRa4HM/xTITmwja7WHeOc2yf6zIPNtRRVwqiwzTYm+4Ad3lM3YF+nY1w/pEjIQKXkmCbeBl0cJbRjERBSO5yYL216qvHBh76PVwduapwapcC63VsOUMyPczNi3YfTy2XdoXHyRjXn4H5GbiMAruNvQsi1aEftkLOBgq9WebNgkrVbDCtv5G9LyY4nRecw0DEZxnpHCa5+q0/tWZ9Bqefv5xa3e5DGVY6agAI3Tq4IgIWKsNKw8bPTsnA5YLdMHPO2Cg1u59tktMcYGVnfYUl1DEhpUsAC8A7SxfvbjlghTO36KseB9bjVOrGKwsrbDxtBPRfBoAKOBt2cf9tVXodmZLG8kjoNp2UIYMwI1Ng8dfHNvI7FAcWgFSHASMsbU6mwYoX8yxawjChd+vJ8VBedPd1daU6uxdMhC5+UpKSRw82K30V/husgshRQpizUWRXCGrOKogcJYQ5G0V2haDmrILIUUKYs1FkVwhqziqIHCWEORtFdoWgXxXqYRgTM1OgAAAAAElFTkSuQmCC',
    '4': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAA7CAYAAADFJfKzAAAAAXNSR0IArs4c6QAAAWpJREFUaEPtmT1OAlEUhc90UEo3NERLWIUdroM1uAuX4D60ZAFQSicDjXZSMh1GkzGR3PnRmZubORzqybv5znfmvckjwWp1woX8EsGSmpZZUrGQWZklSEA1JpBoIsiszBIkEFvj0Q1O11e/Y8zfcffyhmeHcONgh2Pspikm51B8sEM8zqZYDAx9bLDz8QxPqUUKgAq2rL6FZB7YivqywVbWlwq2rr48sFZ9c+zzASbn+1Tf31mrvstsg9fUOH56DWvV95Ah2R7ts7a/sFZ9D7hfb/GAkp25r7B2fde4/fjajZhgS+v7TcoEW1Xf4owhMVtdXybY2vrSwDapLwusdfPQ8sZhmRW7d8uFgI7//hBsOyMy+8/8ur1wu6ga/ylxko+KZsyCJbtd/NEuszLbbA+of6rbo6d+XugTgg2N33G4zDqGG7q0zIbG7zhcZh3DDV1aZkPjdxwus47hhi4ts6HxOw6XWcdwQ5f+BHnqcRjc2nbaAAAAAElFTkSuQmCC',
    '5': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAA7CAYAAADFJfKzAAAAAXNSR0IArs4c6QAAAepJREFUaEPtmDFSAkEQRf9mkikZJAohhFxAMz2HHkFPoUfQY1ia6QEghBA0gUxCybDQWqoWZ6ZqevtTs0sTM03/ft1/mskwHK5xIJ/MxNaUtJGtKVgYWSNbgwpYG9cAolOCkTWyNagAuY2beBt0cC4o1OdigrP5t+Ck/whXbKONj14Lp4KUqye22cW6cyKQClRO7GW7j5fW0WGIve0OcC8DWzWyDTz2e7iWga2aWJcTL3E3muJB1NjlD/Hc2OXEqwWuxnO8ls9bFIEn1uXEyxmy6ZcoUY1DNLEuJ2ZcJzFFoIl1OfH7bITnY5dD72eWSWKlTswVTRIr34mBFZ4mY9zorsW/3c4RW2JN/JtBDmGK2DJr4tZwCM5NEetdE/8JCM22fjtTxAK7MxtO3NcJ2lcVSWzM7bf5rsfQlFs5EbGedlZeL01sbBMWv++mtNmeLrxrsYds8m3seXcKm417ZitgUL7tye/Ivqsq3A3x/UeZ2dBzTFFA4J5VNifeuljiCTXnpU2VJxZAqZVR2ZjyAlLaOA8uel0kCaWS3dpHxD8gbffdtTAq2cKPBUQz5tPl1fsTG39TqJ8wseolTSSgkU0EhHoaRla9pIkENLKJgFBPw8iqlzSRgEY2ERDqaRhZ9ZImEtDIJgJCPY0fqchfGJeEqAoAAAAASUVORK5CYII=',
    '6': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAA7CAYAAADFJfKzAAAAAXNSR0IArs4c6QAAAglJREFUaEPtmDFWQjEQRR+ddEoHjUKJJRvQTtehS9BV6BJ0GR7tdAFQQgnaQCcldHhA5CBmPsk/8xL4DvWQ5L73JslPCe32DP/kVzLYgjptzhbUWJiz5mwBFLAYF8BEJ4I5a84WQIG4MS7X8N6s4viPcFM89rq4nnAVjQNbaWBWP/IgGeO208e9R2WeEjrsRe0Uz9WDgLXxgKmw4aBLTaYjXHaHeAmQyKeUByv2p8+ygLdBB+effrW+VSTYMh5Om7hypvd3TG8aLdy52nk8QKmvS8uBlVx1xlMSRr93KbBSr0rRdNbvh7PxnPLt1Z86grMVvLbqONtcCWmHDQHWh5X6lRDLENB5bTTYj1EPJ8MJIIjBOGo2xdCHFa6Gc5inQ+GYWa2Ke0eOBhsSOZbLOwkLcBzeUVgAhN07Ouxqo1rmOutjQTvOUWHFxQub2qYwIX3vqtWHFb92su66wkVE+WzWh0WeG5RwxVTuWwJsnoXn+U94qAmwgPsbNes4EWB3P8YApAc2afF7u0Et0pXxUrHZh+LLo/7FghLjBa/386nQe8oR5nz1rK1dfF/aurfou0qHzYyzCMwBjQD7TeT/fqz/yLauKa9nHc6J0MqXByk0UWG3tiq5wGDJAicb3pxNJj15YnOWLHCy4c3ZZNKTJzZnyQInG96cTSY9eWJzlixwsuHN2WTSkyf+ArJNfxiVDrl5AAAAAElFTkSuQmCC',
    '7': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAA7CAYAAADFJfKzAAAAAXNSR0IArs4c6QAAAatJREFUaEPtWDtSAkEQfZtJKBkkCCGEXEAzPAceQU+hR9BzaKYHgBBCwAQyCSXDKqus2tUm2Hbm9dRsEzNDv0+/7qHAbHZEQz6Fg81UaVc2U2HhyrqyGTDgNs5ARBGCK+vKZsBAeBu3Bzj2z4NQ87ae4+ojyFXflzjYf3Hpyuroa46NDztcL7Z40fFEmrNBbLzH3XyFh4BA4wRU3QIFckLb96ek8GlcC2wbr+M+Lstn9msUq4DzpnS3KdjbwRj3lZEcx772yhLtawxWsG+E9P3dUSY2nnRHeO6cVWqJFUrlH+GDbXWxGXbQK1dBUNVk9PwNJYChqgFYm141CSipV993S1xsP2tNZ+2XiT0rqIoDnpYL3HCwRnjPnqJd2plJwUS3sRRMTAsTA8rewjywCViYBlZKYUR83ZyKDUIat/A4GmJa3Q7B7leSslK/8rYm7m4s7cLk+cobPeJ/UnEf6XY9m0gSU3pWTGLy5kSzcaPAal8oMc4R5myMsnV3Olgdb+mfcmXT10hXoSur4y39U65s+hrpKnRldbylf8qVTV8jXYWurI639E81Stkv5Ys5GKcGDzsAAAAASUVORK5CYII=',
    '8': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAA7CAYAAADFJfKzAAAAAXNSR0IArs4c6QAAAf9JREFUaEPtmDFawkAQhV86KaWDRqGEkgtop+fQI+gp9Ah6Du30AFBCCdpAJ6V0+OXTKC47Cdndl28JQ8vuZt78M5O3STAcrnEgv0TF1pS0kq0pWChZJVuDDGgZ1wCiVYKSVbI1yEBFZdzAQ7+HqyN7xt4XE5zOP+npJIvNF2mqY4smim3iZdDBWVleyxmS6UfZXTutJ4ktR7QqwhyxzS7WnWNLtpe4HU1xn/3TaOOt18LJ1kpj3U7cihdRxF60+3hqmdNIECAIfp2NcB64milib7oD3Blg5eFjL/mDEsuYzEq2uNULVlgHlNCzZdZ6BkYhm8Zk61usFrgcz/GcBS1MbUYJp4+kiQXc3rUsoWSxP/jEd65Zkys8Tsa4JlpkItlvMdZylnqPaBXJZB29MTjuiShWEmqUan3totCTkmBCSRN6VqCaE7y9r8OXc3ixLsbeOrHDT+fwYl0Cd0mQg5tSsQ5J+9simIjcK5vLHocgw5N1mK72AbUPPSt64pKvHvPS4EDS3BKebPqEHD/8r5xFUwHszZeK0p7YREAwFES7mB7tdsXbuvMGKN/sCE4ZbwRo/9IoKCARrUzsr6ycPmZe2DfTSicbsAq9j1Kx3imM9AAlGykY77CUrHcKIz1AyUYKxjssJeudwkgPULKRgvEOS8l6pzDSA5RspGC8w/oCrz6UGG32rn8AAAAASUVORK5CYII=',
    '9': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAA7CAYAAADFJfKzAAAAAXNSR0IArs4c6QAAAgVJREFUaEPtmDtWAkEQRR8ZhJJBohBCyAYw03XoEnQVugRdB2a6AAghBE2YTELJ8AzngHy6eqaga6SaMnUa+tZ9XV1MCf3+AmfyVzLYSE2b2UjFwsya2QgqYDGOQKITwcya2QgqUFCMK3hpt3BX3q/YVzLC1fSnkFIKw9KQu3RFQMvBVur4bNVwyXE2T3A7nOKNs4bxrBBsFe+dBrqMjawfnU1QGn8fsjJzjQjsQ7ODp4vM7yYf+JgMcC3AGx7WE99tCM95FopzcNibehu92n7bpWxRKZCwGxzWvfkZHgdjPLuCSyVB4OwWA+uNJRFngSifLiw8aTiw9xUD6904dU3N8Toa4j7gcBUclmpQ5IRUbWLRcN9ToZtUcFh4rp5dYKowq5SePizyz8NZR08BLOCzmwW4+X8dsOmOPWcxL7Ae2JQozy+f9D5Nyug5mpQu2JVCp+W/q8XdqBRcPXkjuvmce8SMEpbq3gomKL5ZYoLSMBunsK5YcicoiXdS4ScocExREQ5/XlMJArBus8t4b/1GjeBNxRLqqIFCxqqYWRwxH0uc1VXTFInx8sPzTE87rVsSVNDsenTK/f449GjougLlzG5+G2lZ7nz+Hyx/0hBZUYxZka3zP9Rg+TXTscLM6vDE36WZ5ddMxwozq8MTf5dmll8zHSvMrA5P/F2aWX7NdKw4K7O/nPmBGOC1N8gAAAAASUVORK5CYII=',
    'X': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAA7CAYAAADFJfKzAAAAAXNSR0IArs4c6QAAAINJREFUaEPt1AERACAMxLDh3xqewAAKSnDAN7c1e5/55C2fjZZWNhp2lFU2sADGgYjPLyirbGABjAMRHSiMMQ4sgHEgomuMMcaBBTAORHSNMcY4sADGgYiuMcYYBxbAOBDRNcYY48ACGAciusYYYxxYAONARNcYY4wDC2AciOgaf8X4Ao2emQlFqGRkAAAAAElFTkSuQmCC',
  };

  // 전체 복사를 위해 콘솔도 확인하세요.

  // 전체 복사를 위해 콘솔도 확인하세요.

  // 예약 페이지에서 실행할 코드
  if (currentUrl.includes('/Reservation/')) {
    // 페이지가 완전히 로드된 후 실행
    window.addEventListener('load', function () {
      setTimeout(function () {
        // 약관 동의 체크박스 자동 체크
        const checkboxes = [
          'input[name="virtual_num_yn"]',
          'input[name="safe_address_yn"]',
          'input#bs_S_0',
          'input#allCCchk',
          'input#allchkChannelList',
          'input[name="termsServiceAgreeAll"]'
        ];

        checkboxes.forEach(selector => {
          const element = document.querySelector(selector);
          if (element) {
            // 체크박스가 체크되어 있지 않은 경우에만 클릭
            if (!element.checked) {
              element.click();
              console.log(`체크박스 ${selector} 체크됨`);
            } else {
              console.log(`체크박스 ${selector} 이미 체크됨`);
            }
          }
        });


        // 물품명 자동 입력
        const productNameInput = document.querySelector('input[name="comm_p_code_name"]');
        if (productNameInput) {
          productNameInput.value = 'FineMotion';
          // 입력 이벤트 트리거 (일부 사이트에서 필요할 수 있음)
          productNameInput.dispatchEvent(new Event('input', { bubbles: true }));
          productNameInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // 물품 단가 29만원 설정
        const priceInput = document.querySelector('input[name="p_pric"]');
        if (priceInput) {
          priceInput.value = '29';
          priceInput.dispatchEvent(new Event('input', { bubbles: true }));
          priceInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        console.log('Logii 자동 입력 완료!');
      }, 600); // 페이지 요소들이 동적으로 로드될 수 있으므로 조금 대기
      setTimeout(function () {
        ChannelOrderCall();
      }, 800);
    });

  }

  // 패스워드 입력 페이지에서 실행할 코드
  if (currentUrl === 'https://www.logii.com/LogiiPay/Secure_Keypad.pms?tp=1' || currentUrl.includes('/interface/keypad/interface/keypad.asp')) {
    console.log('패스워드 입력 페이지 감지됨');

    // 이미지 유사도 계산 함수
    function calculateSimilarity(data1, data2) {
      if (data1.length !== data2.length) return 0;

      let matches = 0;
      for (let i = 0; i < data1.length; i += 4) {
        // RGB 값 비교 (Alpha 채널 무시)
        const r1 = data1[i];
        const g1 = data1[i + 1];
        const b1 = data1[i + 2];
        const r2 = data2[i];
        const g2 = data2[i + 1];
        const b2 = data2[i + 2];

        // 색상 차이 계산
        const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
        if (diff < 30) { // 허용 오차
          matches++;
        }
      }

      return matches / (data1.length / 4);
    }

    // Base64 이미지를 ImageData로 변환
    async function base64ToImageData(base64, width, height) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(ctx.getImageData(0, 0, width, height));
        };
        img.src = base64;
      });
    }

    // 키패드 이미지 분석 함수
    async function analyzeKeypad() {
      // 키패드 이미지 URL 찾기
      const keypadImage = document.querySelector('.keyboard .number');
      if (!keypadImage) {
        console.error('키패드 이미지를 찾을 수 없습니다.');
        return null;
      }

      // 배경 이미지 URL 추출
      const bgStyle = window.getComputedStyle(keypadImage);
      const bgImage = bgStyle.backgroundImage;
      const urlMatch = bgImage.match(/url\("?(.+?)"?\)/);
      if (!urlMatch) {
        console.error('키패드 이미지 URL을 찾을 수 없습니다.');
        return null;
      }

      const originalUrl = urlMatch[1];
      console.log('원본 키패드 이미지 URL:', originalUrl);

      return new Promise((resolve) => {
        GM_xmlhttpRequest({
          method: 'GET',
          url: originalUrl,
          responseType: 'blob',
          onload: function (response) {
            if (response.status === 200) {
              const blob = response.response;
              const reader = new FileReader();

              reader.onloadend = async function () {
                const dataUrl = reader.result;
                const img = new Image();

                img.onload = async function () {
                  console.log('키패드 이미지 로드 성공');
                  const canvas = document.createElement('canvas');
                  canvas.width = 236;
                  canvas.height = 177;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0);

                  // 4x3 그리드로 분할
                  const cellWidth = 59;
                  const cellHeight = 59;
                  const keypadMap = {};

                  for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 4; col++) {
                      const x = col * cellWidth;
                      const y = row * cellHeight;

                      // 셀 이미지 데이터 추출
                      const cellData = ctx.getImageData(x, y, cellWidth, cellHeight);

                      // 템플릿과 비교
                      let bestMatch = { number: 'X', similarity: 0 };

                      for (const [number, template] of Object.entries(numberTemplates)) {
                        const templateData = await base64ToImageData(template, cellWidth, cellHeight);
                        const similarity = calculateSimilarity(cellData.data, templateData.data);

                        if (similarity > bestMatch.similarity) {
                          bestMatch = { number, similarity };
                        }
                      }

                      if (bestMatch.similarity > 0.85) { // 임계값을 약간 낮춤
                        const position = `${row}_${col}`;
                        keypadMap[position] = bestMatch.number;
                        console.log(`✓ 위치 [${row},${col}] = ${bestMatch.number} (유사도: ${bestMatch.similarity.toFixed(3)})`);
                      }
                    }
                  }

                  resolve(keypadMap);
                };

                img.onerror = function () {
                  console.error('이미지 로드 실패');
                  resolve(null);
                };

                img.src = dataUrl;
              };

              reader.readAsDataURL(blob);
            } else {
              console.error('이미지 다운로드 실패:', response.status);
              resolve(null);
            }
          },
          onerror: function (error) {
            console.error('GM_xmlhttpRequest 오류:', error);
            resolve(null);
          }
        });
      });
    }

    // 숫자 위치 찾기 함수
    function findNumberPosition(keypadMap, targetNumber) {
      for (const [position, number] of Object.entries(keypadMap)) {
        if (number === targetNumber) {
          return position.split('_').map(n => parseInt(n));
        }
      }
      return null;
    }

    // 자동 입력 실행
    window.addEventListener('load', function () {
      setTimeout(async function () {
        console.log('키패드 분석 시작...');

        // 키패드 이미지 분석
        const keypadMap = await analyzeKeypad();
        if (!keypadMap) {
          console.error('키패드 분석 실패');
          return;
        }

        console.log('키패드 맵:', keypadMap);

        // 패스워드 입력
        const positions = [];

        for (const digit of PASSWORD) {
          const pos = findNumberPosition(keypadMap, digit);
          if (pos) {
            positions.push({ digit, row: pos[0], col: pos[1] });
          } else {
            console.error(`숫자 ${digit}의 위치를 찾을 수 없습니다.`);
            return;
          }
        }

        console.log('입력할 숫자 위치:', positions);

        // 순차적으로 클릭
        function clickNext(index) {
          if (index >= positions.length) {
            console.log('패스워드 입력 완료!');
            return;
          }

          const { digit, row, col } = positions[index];
          console.log(`${index + 1}번째 숫자 ${digit} 입력 (위치: [${row},${col}])`);

          // 실제 버튼 클릭
          const buttons = document.querySelectorAll('.keyboard .key');
          const buttonIndex = row * 4 + col;

          if (buttons[buttonIndex]) {
            buttons[buttonIndex].click();
          } else if (typeof window.doClick === 'function') {
            // 대체 방법: doClick 함수 사용
            window.doClick(digit);
          }

          // 다음 숫자 입력
          setTimeout(() => clickNext(index + 1), 50);
        }

        // 입력 시작
        clickNext(0);

      }, 1000);
    });
  }
})();