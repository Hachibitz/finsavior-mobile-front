export function mapToCategory(description: string, name: string): string {
    const str = (description + ' ' + name).toLowerCase();
  
    if (str.includes('feira') || str.includes('alimentação') || str.includes('comida')) return 'Alimentação';
    if (str.includes('energia') || str.includes('água') || str.includes('internet') || str.includes('aluguel')) return 'Moradia';
    if (str.includes('combustível') || str.includes('passagem')) return 'Transporte';
    if (str.includes('assinatura') || str.includes('netflix') || str.includes('prime')) return 'Lazer/Assinaturas';
    if (str.includes('poupança') || str.includes('seguro')) return 'Investimentos';
    if (str.includes('pós-graduação') || str.includes('curso')) return 'Educação';
  
    return 'Outros';
}
  