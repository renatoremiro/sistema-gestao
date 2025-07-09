export const config = {
    versao: '8.12.1',
    tipos: [
        { value: 'reuniao', label: 'Reunião' },
        { value: 'entrega', label: 'Entrega' },
        { value: 'prazo', label: 'Prazo' }
    ]
};

export const state = {
    modalAtivo: false,
    eventoEditando: null,
    modoEdicao: false
};
