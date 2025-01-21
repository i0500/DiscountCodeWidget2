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
                description: columns[2]?.replace(/"/g, '')
            };
        });
    }

    formatNumber(number) {
        const num = number.toString().replace(/[^0-9]/g, '');
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원";
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

        if (validCodes.length === 0) {
            this.renderError('현재 사용 가능한 할인코드가 없습니다.');
            return;
        }

        this.container.innerHTML = `
            <div style="max-width: 800px; margin: 20px auto; padding: 20px; background: #ffffff; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <div style="padding-bottom: 15px; margin-bottom: 15px; border-bottom: 2px solid #f0f0f0; text-align: center;">
                    <h3 style="color: #333; margin: 0; font-size: 18px; font-weight: 600;">🎫 마이리얼트립 할인코드</h3>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    ${validCodes.map(code => {
                        const [year, month] = code.month.split('-');
                        const isCurrentMonth = (parseInt(year) === currentYear && parseInt(month) === currentMonth);
                        return `
                            <tr style="border-bottom: 1px solid #e9ecef; ${isCurrentMonth ? 'background: #fff3e0;' : ''}">
                                <td style="padding: 12px; text-align: center; font-weight: 600; color: #ff5722;">${code.code}</td>
                                <td style="padding: 12px; text-align: center;">${this.formatNumber(code.description)}</td>
                                <td style="padding: 12px; text-align: center;">
                                    <button onclick="navigator.clipboard.writeText('${code.code}').then(() => alert('할인코드가 복사되었습니다!'))" style="
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
                        `;
                    }).join('')}
                </table>
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
