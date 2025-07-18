export const PLANS = [
    {
        name: 'FREE',
        priceMonthly: 'R$ 0,00',
        priceYearly: null,
        features: [
            '1 análise para teste',
            '2 mensagens com a Savi por mês (assistente financeira de IA)',
            'Até 4.000 tokens de IA por mês'
        ],
        type: 'FREE',
    },
    {
        name: 'BASIC MENSAL',
        priceMonthly: 'R$ 5,90',
        priceYearly: 'R$ 59,90',
        features: [
            '3 análises mensais, 1 trimestral',
            '15 mensagens com a Savi por mês (assistente financeira de IA)',
            'Até 30.000 tokens de IA por mês',
            'Controle do nível de criatividade/precisão',
            'Sem anúncios forçados'
        ],
        trial: true,
        type: 'STRIPE_BASIC_MONTHLY',
    },
    {
        name: 'PLUS MENSAL',
        priceMonthly: 'R$ 12,90',
        priceYearly: 'R$ 129,90',
        features: [
            '12 análises mensais, 3 trimestrais, 1 anual',
            '50 mensagens com a Savi por mês (assistente financeira de IA)',
            'Até 100.000 tokens de IA por mês',
            'Suporte prioritário',
            'Controle do nível de criatividade/precisão',
            'Sem anúncios forçados'
        ],
        type: 'STRIPE_PLUS_MONTHLY',
        trial: true,
    },
    {
        name: 'PREMIUM MENSAL',
        priceMonthly: 'R$ 25,90',
        priceYearly: 'R$ 200,00',
        features: [
            'Análises ilimitadas',
            'Mensagens ilimitadas com a Savi (assistente financeira de IA)',
            'Tokens ilimitados de IA por mês',
            'Suporte personalizado e prioritário',
            'Controle do nível de criatividade/precisão',
            'Maior desconto no anual!',
            'Sem anúncios forçados'
        ],
        trial: true,
        type: 'STRIPE_PREMIUM_MONTHLY',
    },
    {
        name: 'BASIC ANUAL',
        priceMonthly: 'R$ 5,90',
        priceYearly: 'R$ 59,90',
        features: [
            '3 análises mensais, 1 trimestral',
            '15 mensagens com a Savi por mês (assistente financeira de IA)',
            'Até 30.000 tokens de IA por mês',
            'Controle do nível de criatividade/precisão',
            'Sem anúncios forçados'
        ],
        trial: true,
        type: 'STRIPE_BASIC_ANNUAL',
    },
    {
        name: 'PLUS ANUAL',
        priceMonthly: 'R$ 12,90',
        priceYearly: 'R$ 129,90',
        features: [
            '12 análises mensais, 3 trimestrais, 1 anual',
            '50 mensagens com a Savi por mês (assistente financeira de IA)',
            'Até 100.000 tokens de IA por mês',
            'Suporte prioritário',
            'Controle do nível de criatividade/precisão',
            'Sem anúncios forçados'
        ],
        type: 'STRIPE_PLUS_ANNUAL',
        trial: true,
    },
    {
        name: 'PREMIUM ANUAL',
        priceMonthly: 'R$ 25,90',
        priceYearly: 'R$ 200,00',
        features: [
            'Análises ilimitadas',
            'Mensagens ilimitadas com a Savi (assistente financeira de IA)',
            'Tokens ilimitados de IA por mês',
            'Suporte personalizado e prioritário',
            'Controle do nível de criatividade/precisão',
            'Maior desconto no anual!',
            'Sem anúncios forçados'
        ],
        trial: true,
        type: 'STRIPE_PREMIUM_ANNUAL',
    },
];

export interface CheckoutSessionDTO {
    planType: string;
    url: string;
    email: string;
    clientSecret: string;
}