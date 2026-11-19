# Olhos e venda — identidade no motor 2.5D

Os nomes usados aqui são Sharingan, Byakugan e Rinnegan, conforme o pedido do usuário inspirado em Naruto. Normalizar a grafia“biakugan” para Byakugan nos metadados quando for esse o nome pretendido; conferir nomes contra o áudio e o pedido antes de escrever legendas. Não confundir a aparência com o nome falado numa referência que contenha inconsistências.

## Presets executáveis

`assets/demo/studio/src/engine/eyes.tsx` exporta `SpecialEye`, `StarBlindfold` e `EyeStyle`. O próprio `Actor`/`Hero` foi integrado a esses presets; não é apenas uma descrição de prompt.

| eyeStyle | Aparência vetorial |
|---|---|
| natural | Renderer original preservado por padrão. |
| white | Olho branco sem íris nem pupila; estado da protagonista ainda sem transformação. |
| sharingan | Íris vermelha, pupila escura, órbita e 1/2/3 tomoe; não são apenas pontos decorativos. |
| byakugan | Íris perolada/lilás muito clara com centro discreto; distinta do branco sem íris. |
| rinnegan | Íris roxa com anéis concêntricos e centro escuro. |

São presets estilizados2.5D. Não representam todos os desenhos/variantes da franquia, não adicionam modelagem 3D e precisam ser comparados com a variante realmente visível. Não transformar todo Sharingan em Mangekyō nem acrescentar veias/efeitos que não apareçam na referência.

## APIs reais, sem campos inventados

`Look.eyeStyle` e `Look.eyeTomoe` definem identidade. `Pose.eyeStyle`/`Pose.eyeTomoe` só sobrescrevem em acontecimentos explícitos. `Look.spectacles` adiciona aros redondos transparentes; `Pose.glasses` continua sendo o óculos escuro antigo. Aros transparentes deixam a íris visível.

```tsx
const girlLook = {...LOOKS.sis, eyeStyle: 'white' as const};
const boyfriendLook = {...NPC.tomas, eyeStyle: 'sharingan' as const, eyeTomoe: 3 as const};
const sisterLook = {...LOOKS.mom, eyeStyle: 'rinnegan' as const};
const paleEyesLook = {...NPC.beto, eyeStyle: 'byakugan' as const, spectacles: true};
<Actor look={girlLook} pose={{...basePose, eyeCover: true, eyeCoverLift: 0}} />
```

Esses campos existem no renderer TypeScript. Não são comandos novos doCLI nem campos automaticamente aceitos por todo compilador/script.json. Ligar a ficha do personagem ao renderer do episódio. Aplicar overrides depois da função que deriva a pose, para não perdê-los por interpolação.

## Ocultação e continuidade

`Pose.eyeCover=true` desenha uma venda roxa estrelada e remove a geometria dos olhos/glint por baixo dela. `Pose.eyesHidden=true` suprime os olhos sem desenhar um objeto: o autor pode fornecer outro acessório. `eyeCoverLift` faz um início de gesto, limitado a 6 unidades; não revela a íris enquanto a venda estiver ativa. Os campos são opcionais e a demo original mantém os olhos antigos.

A aparência dos olhos não pode ser escolhida aleatoriamente por quadro ou por emoção. Separar o estado de nascimento/transformação de pálpebras, olhar e expressão. O `white` não deve virarByakugan/Rinnegan por aproximação de cor. Se a identidade final é desconhecida, não atribuí-la por especulação.

Validar: close com olhos abertos, piscar, olhar lateral, máscara ativa e quadro anterior ao corte final. Checar os dois olhos, não apenas um. EstruturaSVG e tipos podem comprovar que a venda remove íris do renderer; só a revisão visual avalia composição, atuação e fidelidade à referência.
