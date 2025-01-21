// 마이리얼트립 할인코드 위젯
class MRTDiscountWidget {
    constructor(containerId) {
        this.SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5T29-AWf2qBzXjwh8GVPKAZ7j1eByUthhAY1XYrBNtGrCyihkHCrNOr2S_r66SYkf9MsOZR6E-y8m/pub?output=csv';
        this.container = document.getElementById(containerId);
        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.SHEET_URL);
            const csvText = await response.text();
            const codes = this.parseCSV(csvText);
            this.renderWidget(codes);
        } catch (error) {
            console.error('할인코드 로딩 실패:', error);
            this.renderError();
        }
    }

    parseCSV(csvText) {
        const rows = csvText.split('\n');
        return rows.slice(1).map(row => {
            const columns = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            return {
                month: columns[0]?.replace(/"/g, ''),
                code: columns[1]?.replace(/"/g, ''),
                description: columns[2]?.replace(/"/g, ''),
                category: columns[3]?.replace(/"/g, '')
            };
        });
    }

    formatNumber(number) {
        const num = number.toString().replace(/[^0-9]/g, '');
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원";
    }

    getCategoryColor(category) {
        const categoryColors = {
            '숙소': '#4CAF50',
            '한인민박': '#4CAF50',
            '호텔': '#4CAF50',
            '리조트': '#4CAF50',
            '투어': '#2196F3',
            '티켓': '#2196F3',
            '액티비티': '#2196F3',
            '클래스': '#2196F3',
            '전 세계': '#9C27B0',
            '해외': '#9C27B0',
            '5만원 이상': '#FF9800',
            '7만원 이상': '#FF9800',
            '10만원 이상': '#FF9800',
            '20만원 이상': '#FF9800',
            '여행편의': '#757575',
            '여행편의 상품': '#757575',
            '전체': '#607D8B'
        };
        return categoryColors[category.trim()] || '#757575';
    }

    copyCode(code) {
        navigator.clipboard.writeText(code).then(() => {
            alert('할인코드가 복사되었습니다!');
        }).catch(err => {
            alert(`할인코드: ${code}\n(직접 복사해서 사용해주세요)`);
        });
    }

    renderWidget(codes) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        const validCodes = codes
            .filter(code => {
                const [year, month] = code.month.split('-').map(num => parseInt(num));
                return year > currentYear || (year === currentYear && month >= currentMonth);
            })
            .sort((a, b) => b.month.localeCompare(a.month));

        this.container.innerHTML = `
            <div id="mrt-discount-codes" class="discount-code-container" style="max-width: 800px; margin: 20px auto; padding: 20px; background: #ffffff; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); font-family: 'Noto Sans KR', sans-serif;">
                <div class="discount-header" style="padding-bottom: 15px; margin-bottom: 15px; border-bottom: 2px solid #f0f0f0; text-align: center;">
                    <h3 style="color: #333; margin: 0; font-size: 18px; font-weight: 600;">🎫 마이리얼트립 할인코드 목록</h3>
                </div>
                <div class="discount-table" style="width: 100%; overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 12px; text-align: center; color: #495057;">날짜</th>
                                <th style="padding: 12px; text-align: center; color: #495057;">할인코드</th>
                                <th style="padding: 12px; text-align: center; color: #495057;">할인금액</th>
                                <th style="padding: 12px; text-align: center; color: #495057;">복사</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${validCodes.map(code => {
                                const [year, month] = code.month.split('-');
                                const isCurrentMonth = (parseInt(year) === currentYear && parseInt(month) === currentMonth);
                                return `
                                    <tr style="${isCurrentMonth ? 'background: #fff3e0;' : ''}">
                                        <td style="padding: 12px; text-align: center; color: #495057;">
                                            ${year}년 ${month}월
                                            ${isCurrentMonth ? '<span style="color: #ff5722; font-size: 12px; margin-left: 5px;">사용가능</span>' : ''}
                                        </td>
                                        <td style="padding: 12px; text-align: center; font-weight: 600; color: #ff5722;">
                                            ${code.code}
                                        </td>
                                        <td style="padding: 12px; text-align: center; color: #495057;">
                                            ${this.formatNumber(code.description)}
                                        </td>
                                        <td style="padding: 12px; text-align: center;">
                                            <button onclick="discountWidget.copyCode('${code.code}')" style="
                                                background: ${isCurrentMonth ? '#ff5722' : '#6c757d'};
                                                color: white;
                                                border: none;
                                                padding: 6px 12px;
                                                border-radius: 4px;
                                                cursor: pointer;
                                                font-size: 12px;
                                            ">복사</button>
                                        </td>
                                    </tr>
                                    ${code.category ? `
                                        <tr style="${isCurrentMonth ? 'background: #fff3e0;' : ''};border-bottom: 1px solid #f0f0f0;">
                                            <td colspan="4" style="padding: 8px 12px;">
                                                <div style="display: flex; flex-wrap: wrap; gap: 4px; padding-left: 12px;">
                                                    ${code.category.split(',').map(cat => `
                                                        <span style="
                                                            display: inline-block;
                                                            background: ${this.getCategoryColor(cat.trim())};
                                                            color: white;
                                                            padding: 3px 8px;
                                                            border-radius: 4px;
                                                            font-size: 12px;
                                                        ">${cat.trim()}</span>
                                                    `).join('')}
                                                </div>
                                            </td>
                                        </tr>
                                    ` : ''}
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderError(message = '할인코드를 불러오는데 실패했습니다.') {
        this.container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #6c757d;">
                ${message}
            </div>
        `;
    }
}
