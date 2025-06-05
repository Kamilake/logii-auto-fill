// ==UserScript==
// @name         Logii 택배 자동 입력
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Logii 택배 예약 시 자동 입력 및 체크박스 자동 체크
// @author       You
// @match        https://www.logii.com/Reservation/*
// @match        https://www.logii.com/LogiiPay/Secure_Keypad.pms?tp=1
// @match        https://m.logii.com/interface/keypad/interface/keypad.asp*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 현재 URL 확인
    const currentUrl = window.location.href;


 // 생성된 템플릿 (11개) 
const numberTemplates = {
    '0': 'data:image/png;base64, ... ',
    '1': 'data:image/png;base64, ... ',
    '2': 'data:image/png;base64, ... ',
    '3': 'data:image/png;base64, ... ',
    '4': 'data:image/png;base64, ... ',
    '5': 'data:image/png;base64, ... ',
    '6': 'data:image/png;base64, ... ',
    '7': 'data:image/png;base64, ... ',
    '8': 'data:image/png;base64, ... ',
    '9': 'data:image/png;base64, ... ',
    'X': 'data:image/png;base64, ... ',
}; // 이 코드는 실제로 작동하지만 너무 길어서 여기서 생략했습니다.

// 전체 복사를 위해 콘솔도 확인하세요.

    // 예약 페이지에서 실행할 코드
    if (currentUrl.includes('/Reservation/')) {
        // 페이지가 완전히 로드된 후 실행
        window.addEventListener('load', function() {
            setTimeout(function() {
                // 약관 동의 체크박스 자동 체크
                const checkboxes = [
                  'input[name="virtual_num_yn"]',
                  'input[name="safe_address_yn"]',
                  'input#bs_S_0',
                  'input[name="termsServiceAgreeAll"]'
                ];

                checkboxes.forEach(selector => {
                    const element = document.querySelector(selector);
                    if (element) {
                        // value가 "N"인 경우에만 클릭하여 "Y"로 변경
                        if (element.value === "N") {
                            element.click();
                            console.log(`체크박스 ${selector} 클릭됨 (N -> Y)`);
                        } else {
                            console.log(`체크박스 ${selector} 이미 활성화됨 (value: ${element.value})`);
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
            }, 1000); // 페이지 요소들이 동적으로 로드될 수 있으므로 1초 대기
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
                img.onload = function() {
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
            // 프록시 서버 사용
            const proxyUrl = `http://localhost:3000/proxy?url=${encodeURIComponent(originalUrl)}`;
            
            console.log('원본 키패드 이미지 URL:', originalUrl);
            console.log('프록시 URL 사용:', proxyUrl);

            // 이미지 로드
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = async function() {
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
                                
                                console.log(`위치 [${row},${col}] - 숫자 ${number}: 유사도 ${similarity.toFixed(3)}`);
                                
                                if (similarity > bestMatch.similarity) {
                                    bestMatch = { number, similarity };
                                }
                            }
                            
                            if (bestMatch.similarity > 0.9) {
                                const position = `${row}_${col}`;
                                keypadMap[position] = bestMatch.number;
                                console.log(`✓ 위치 [${row},${col}] = ${bestMatch.number} (유사도: ${bestMatch.similarity.toFixed(3)})`);
                            }
                        }
                    }

                    resolve(keypadMap);
                };
                img.onerror = function(e) {
                    console.error('키패드 이미지 로드 실패:', e);
                    console.error('프록시 서버가 실행 중인지 확인하세요');
                    console.error('Windows에서 Docker 실행: docker-compose up -d');
                    console.error('또는 직접 실행: cd logii-auto-fill && npm install && npm start');
                    resolve(null);
                };
                // 프록시 URL 사용
                img.src = proxyUrl;
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
        window.addEventListener('load', function() {
            setTimeout(async function() {
                console.log('키패드 분석 시작...');
                
                // 키패드 이미지 분석
                const keypadMap = await analyzeKeypad();
                if (!keypadMap) {
                    console.error('키패드 분석 실패');
                    return;
                }

                console.log('키패드 맵:', keypadMap);

                // 패스워드 입력
                const password = '123456';
                const positions = [];

                for (const digit of password) {
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
                    setTimeout(() => clickNext(index + 1), 500);
                }

                // 입력 시작
                clickNext(0);

            }, 2000);
        });
    }
})();