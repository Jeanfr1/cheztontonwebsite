# Roteiro cinematográfico

## Ideia: abrir, revelar, servir, encontrar
A câmera começa dentro do frigorífico. Uma garrafa avança; a luz fria cede lugar ao papel creme. O copo entra em outro plano. Um arco de cerveja aproxima o hero do balcão. A narrativa se abre para bar/cave e termina no encontro.

## Montagem com as imagens do kit
Seção desktop de 260svh, palco sticky 100svh. Progresso normalizado pelo percurso efetivo da seção. Scroll nativo, sem capturar a roda e sem carregamento que impeça acesso ao telefone/mapa.

| Progresso | Cena | Composição executável |
| --- | --- | --- |
| 0–0,15 | Frio e expectativa | Foto POV do frigorífico ocupa a tela; zoom sutil 1,06 para 1,02. Título e ações já disponíveis. |
| 0,15–0,38 | A garrafa sai | Foto do frigo se dissolve para papel. PNG da garrafa entra da direita com translação e escala; não isolar automaticamente a mão da foto. |
| 0,38–0,58 | O cartaz ganha volume | Garrafa estabiliza; copo aparece em primeiro plano; arco de cerveja entra por opacity/transform. Texto continua sendo HTML. |
| 0,58–0,78 | Da cave ao comptoir | Arco se desloca discretamente, copo se estabiliza e sombras acompanham os objetos. Poucas gotas embutidas no próprio asset, não milhares de partículas. |
| 0,78–1 | O lugar aparece | Objetos se dissolvem; duas janelas com as fotos reais do bar e da cave aparecem à direita. Ao sair do sticky, a curva reaparece como detalhe no bloco seguinte. |

## Versão cinematográfica avançada, se houver vídeo/3D na implementação
Filmar a retirada real da garrafa ou criar cena 3D única com câmera e luz consistentes. Animar líquido a partir de malha/simulação ou vídeo com alpha. O copo é revelado, não explode. O momento de pressão precisa de gesto real ou take filmado; não presumir que uma foto estática contém o movimento. Transição para amigos por corte com forma circular do copo/mesa. Preparar poster e alternativa estática.

O kit não contém essa filmagem nem promete continuidade física entre fotos independentes. A prova offline demonstra a versão com camadas e dissolves; o roteiro avançado define o próximo nível de produção.

## Seções interligadas
- Du comptoir à la cave: janelas com fotos reais, entrada 24px/300ms.
- Les bons moments se partagent: ponto de vista baixo de amigos, imagem estática com parallax máximo 14px no desktop.
- Bières, vins, spiritueux: cards editoriais; sem carrinho ou estoque fictício. Rótulos de catálogo precisam dos produtos reais autorizados.
- Les rendez-vous: bloco bordô, fotografia de gesto/atmosfera. Agenda atualizada pelo estabelecimento, nunca datas de exemplo apresentadas como reais.
- Services: microinterações curtas, mapa e telefone acessíveis.

## Mobile e reduced motion
Até 760px, eliminar pin longo: papel, objetos fixos e título legível em uma tela. Foto frigorífico pode ficar como detalhe abaixo. Imagens bar/cave e serviços continuam no fluxo normal. prefers-reduced-motion: composição estática e todas as ações acessíveis, sem scroll obrigatório para ler conteúdo.

## Engenharia da montagem
Transforms e opacity, requestAnimationFrame ou timeline equivalente. É possível usar GSAP/ScrollTrigger na implementação, mas o estudo fornecido não depende deles. Não animar blur em toda a tela por longos períodos. Tipografia nunca rasterizada; links em camada interativa. Exportar AVIF/WebP responsivos, mantendo PNGs originais. Orçamento inicial proposto: 1,5MB no primeiro viewport, a medir; não pré-carregar todo o álbum.
