import { SmartContractErrors } from "../../interfaces/transaction-info.interface";

export const SMART_CONTRACT_ERRORS: SmartContractErrors = {
    1: 'Fundo insuficiente. Verifique se você possui saldo suficiente para realizar esta operação.',
    4000: 'Permissão negada. Você não tem autorização para executar esta operação.',
    4001: 'Condição não atendida. Verifique se o valor informado atende aos requisitos mínimos.',
    4003: 'Ordem não encontrada.',
    4004: 'Já existe uma ordem ativa para esta carteira.',
    4999: 'O contrato está bloqueado no momento.'
} as const;