export const config = {
    versao: '8.12.2',
    DIAS_SEMANA: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    MESES: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
};

export const state = {
    mesAtual: new Date().getMonth(),
    anoAtual: new Date().getFullYear(),
    diaSelecionado: new Date().getDate(),
    carregado: false
};
