# Análise descritiva — comércio de câmeras de segurança

> **Aviso acadêmico:** todos os dados desta análise são 100% fictícios e foram criados apenas para demonstrar conceitos de Probabilidade e Estatística. Eles não representam vendas, faturamento, desempenho ou qualquer resultado real da Solutec.

## Conjunto demonstrativo

Foram simuladas 63 unidades vendidas entre janeiro e junho, distribuídas entre quatro categorias. A base completa e reproduzível está em [`dados-simulados.csv`](dados-simulados.csv).

| Mês | Câmeras IP | Câmeras analógicas | Gravadores | Acessórios | Total |
|---|---:|---:|---:|---:|---:|
| Janeiro | 3 | 2 | 2 | 1 | 8 |
| Fevereiro | 4 | 3 | 2 | 1 | 10 |
| Março | 3 | 3 | 2 | 1 | 9 |
| Abril | 5 | 4 | 2 | 2 | 13 |
| Maio | 4 | 3 | 2 | 2 | 11 |
| Junho | 5 | 3 | 2 | 2 | 12 |

## Vendas por categoria

![Gráfico de barras das vendas simuladas por categoria](grafico-vendas-categoria.svg)

No semestre simulado, câmeras IP somam 24 unidades (38,1%), câmeras analógicas 18 (28,6%), gravadores 12 (19,0%) e acessórios 9 (14,3%). A categoria de câmeras IP é a mais frequente nesse cenário hipotético.

## Evolução mensal

![Gráfico da série temporal de vendas mensais simuladas](grafico-evolucao-mensal.svg)

Os totais mensais simulados são: 8, 10, 9, 13, 11 e 12 unidades.

- **Média:** (8 + 10 + 9 + 13 + 11 + 12) ÷ 6 = **10,5 unidades por mês**.
- **Mediana:** ordenando os valores (8, 9, 10, 11, 12, 13), a média dos dois valores centrais é (10 + 11) ÷ 2 = **10,5 unidades**.

A igualdade entre média e mediana indica que, neste conjunto pequeno e simulado, não há valor extremo deslocando o centro da distribuição. A série oscila, com pico hipotético em abril (13) e menor valor em janeiro (8); seis observações não permitem concluir tendência ou sazonalidade.

## Possível apoio a decisões comerciais

Em uma operação real, análises semelhantes poderiam ajudar a estimar demanda por categoria, planejar estoque, identificar meses de maior procura e avaliar a composição das vendas. Decisões confiáveis exigiriam uma série histórica maior, dados reais validados e métricas adicionais, como receita, margem, devoluções e estoque disponível.
