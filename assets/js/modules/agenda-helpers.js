/**
 * 📋 Agenda Helpers - utilitários simples para manipulção de datas da agenda.
 * Estas funções são utilizadas em páginas de demonstração e não possuem dependências externas.
 */

const AgendaHelpers = {
    /**
     * Retorna o primeiro dia (segunda-feira) da semana da data fornecida.
     * @param {Date|string} data
     * @returns {Date}
     */
    inicioDaSemana(data = new Date()) {
        const d = new Date(data);
        const dia = d.getDay(); // 0=domingo,1=segunda
        const diff = (dia === 0 ? -6 : 1) - dia;
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
    },

    /**
     * Retorna um array com os sete dias da semana da data fornecida.
     * @param {Date|string} data
     * @returns {Date[]}
     */
    diasDaSemana(data = new Date()) {
        const inicio = this.inicioDaSemana(data);
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(inicio);
            d.setDate(inicio.getDate() + i);
            return d;
        });
    },

    /**
     * Formata uma data no padrão YYYY-MM-DD.
     * @param {Date|string} data
     * @returns {string}
     */
    formatarData(data) {
        const d = new Date(data);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    }
};
