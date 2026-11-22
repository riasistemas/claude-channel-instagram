# Política de Privacidade

[English](PRIVACY.md) · Português · [Español](PRIVACY.es.md)

Última atualização: 2026-11-21

Esta política descreve como o **plugin `instagram`** (o "plugin") e o
conector do Instagram que ele usa (o "conector") tratam dados. Ela vale
para quem instala e usa o plugin no claude.ai, nos apps do Claude para
desktop e celular, no Cowork ou no Claude Code.

O plugin é software de código aberto distribuído sob a licença Apache-2.0.
O plugin e o conector são mantidos pela RIA SYSTEMS LTDA ("RIA Systems").

## Resumo

- O plugin é um conjunto de instruções (skills) para o Claude mais o
  endereço de um servidor remoto, o conector em
  `https://mcp.lia.im/instagram`. Ele não executa nada no seu computador.
- Se você não conectar o Instagram, nada sai da sua conversa com o Claude:
  o que você cola é tratado pela Anthropic conforme os termos e a política
  de privacidade da sua conta do Claude.
- Se você conectar o Instagram, a RIA Systems guarda o ID e o nome de
  usuário da conta, as permissões concedidas e um token de acesso do
  Instagram cifrado, além das mensagens diretas das contas conectadas, o
  que você aceita na tela de conexão. Para essas conversas a RIA Systems
  atua como operadora em seu nome e as usa só para mostrar o histórico ao
  Claude e, se você contratar, para as respostas da Lia. Os comentários são
  lidos na Meta só quando uma ferramenta roda e não são guardados.

## Sem o conector

Quando você usa o `/instagram:inbox` com uma conversa ou um print colado,
ele fica naquela conversa com o Claude. O plugin não o envia para nenhum
outro lugar, não entra no Instagram e não chama as APIs da Meta.

## Com o conector

Você se conecta entrando com o Instagram a partir do Claude, pelo app
"RIA Social" da RIA Systems na Meta. Você escolhe quais permissões
conceder. Usar o conector significa aceitar os
[Termos do Conector](TERMS.pt.md), dos quais esta política faz parte.

**Papéis**

Para as conversas e os dados das pessoas que escrevem para uma conta
conectada, você é a controladora e a RIA Systems é a operadora: agimos só
conforme as suas instruções, para as finalidades descritas aqui. Para os
dados da sua própria conta (IDs, nome de usuário, token, registros de
aceite, trilha de ações) a RIA Systems é a controladora e os trata para
prestar o conector e manter o registro do que foi autorizado. Aplica-se a
lei brasileira (LGPD, Lei 13.709/2018). Se você estiver na União Europeia
ou no Reino Unido, o GDPR também se aplica, com os mesmos direitos e o
mesmo contato.

**O que o conector guarda**

- O ID e o nome de usuário da sua conta profissional do Instagram e as
  permissões que você concedeu.
- O token de acesso que a Meta emite, cifrado com uma chave usada só pelo
  conector, para chamar a Meta em seu nome.
- Um registro de cada app do Claude que você autorizou (quando conectou e
  quando foi usado pela última vez), para você ver e revogar o acesso.
- Quando e em qual versão você aceitou, para cada conta conectada, que as
  conversas dela sejam guardadas.
- Uma trilha de cada ação que o Claude fez em seu nome (DM enviada,
  resposta a comentário, resposta privada, comentário ocultado): qual
  conta, qual ferramenta, quando e os IDs do Instagram envolvidos. Ela não
  inclui o texto.
- As mensagens diretas de cada conta conectada, recebidas e enviadas,
  incluindo o ID de quem escreveu no escopo do Instagram, como descrito
  abaixo.
- Dados técnicos de curta duração para cumprir os limites de envio da Meta
  e evitar envios duplicados.

**Suas conversas**

A tela de conexão avisa que a RIA Systems guarda as mensagens diretas das
contas conectadas. Depois que você aceita, a Meta entrega à RIA Systems
cada DM que a conta recebe ou envia (pelo Claude ou pelo app do
Instagram), e a RIA Systems a guarda na sua conta da RIA Systems. Elas
servem para mostrar o histórico ao Claude e, só se você ligar depois as
respostas automáticas da Lia (um serviço pago à parte), para que a Lia
possa responder. Ligá-las não pede um novo aceite; as respostas só começam
quando você contrata o serviço. Se você contratar a Lia, os Termos, a
Política de Privacidade e o DPA da Lia
([lia.im/termos](https://lia.im/termos),
[lia.im/privacidade](https://lia.im/privacidade),
[lia.im/dpa](https://lia.im/dpa)) regem as respostas automáticas; o papel
da RIA Systems continua o mesmo: operadora em seu nome. Arquivos de mídia
não são baixados: só o tipo do anexo é guardado.

Comentários, legendas de posts e os nomes de quem os escreveu são buscados
na Meta quando uma ferramenta roda, passados à sua conversa com o Claude e
não são guardados. Nenhum conteúdo de mensagem ou comentário é gravado em
logs.

As conversas ficam guardadas enquanto a conta estiver conectada, mesmo
sem uso. Quando você remove a conta, ou remove o "RIA Social" no
Instagram, o token de acesso é apagado na hora e as conversas em até 30
dias. Os registros de aceite e a
trilha de ações (que não têm texto de mensagem) ficam guardados por 5 anos
para fins legais. Você pode pedir a exclusão das conversas a qualquer
momento (veja "Desconexão e exclusão").

**O que ele envia**

Só as respostas, respostas privadas ou ações de ocultar/reexibir que uma
chamada de ferramenta faz, e que as skills pedem para você aprovar antes.
Valem as regras da Meta: até 24 horas depois da última mensagem do
cliente, até 1000 bytes, só texto.

**Quem mais recebe dados**

- A Meta, que opera o Instagram e a API dele, conforme os termos da Meta.
- A Anthropic, que opera o Claude: os resultados das ferramentas passam a
  fazer parte da sua conversa com o Claude, conforme os termos e a
  política de privacidade da sua conta do Claude.
- Nossos provedores de hospedagem, que guardam os dados em nosso nome:
  Google Cloud, nos Estados Unidos (us-central1), com backups no Google
  Cloud e na Amazon Web Services. Essa transferência internacional se
  apoia nas cláusulas contratuais padrão dos provedores (LGPD, art. 33). O
  Google Cloud (Google LLC) e a Amazon Web Services, Inc. participam do
  EU-U.S. Data Privacy Framework e da sua extensão para o Reino Unido, ou
  oferecem as cláusulas contratuais padrão da UE; as transferências da
  UE/EEE para a RIA no Brasil se apoiam na decisão de adequação da
  Comissão Europeia para o Brasil (Decisão de Execução (UE) 2026/179).

A RIA Systems não vende esses dados, não os usa para publicidade nem
prospecção e não os usa para treinar modelos de IA.

**Desconexão e exclusão**

Remover uma conta na tela de conexão, ou remover o "RIA Social" em
Instagram → Configurações → Permissões do site → Apps e sites, apaga o
token de acesso na hora e as conversas guardadas em até 30 dias (veja
acima). Desconectar o conector nas configurações de conectores do Claude
ou no `/mcp` só revoga o acesso daquele app do Claude. Você também pode
escrever para o endereço de privacidade abaixo: confirmamos em até 2 dias
úteis e concluímos a exclusão em até 15 dias. Os pedidos de exclusão de
dados feitos pela Meta são tratados automaticamente, com um código de
confirmação.

## Dados de outras pessoas

Conversas e comentários do Instagram têm dados pessoais de outras pessoas.
Conecte só uma conta que você administra e cole só o que você pode
compartilhar. Para as conversas que guarda, a RIA Systems trata os dados
dos seus clientes em seu nome; você continua responsável por ter base
legal para guardá-los e respondê-los. As skills pedem ao Claude que não
repita mais desses dados do que a resposta precisa.

Se você escreveu para uma conta conectada e quer que seus dados sejam
apagados, fale com o dono dessa conta: agimos conforme as instruções dele
e vamos ajudá-lo. Nunca entramos em contato por conta própria com os
clientes de uma conta conectada.

## Segurança e incidentes

O token de acesso é guardado cifrado, com uma chave usada só pelo
conector; o acesso às conversas guardadas é restrito ao conector e, se
você contratar, à Lia. Se um incidente de segurança afetar seus dados,
avisamos você e, quando exigido, a Autoridade Nacional de Proteção de
Dados (ANPD).

## O que mais a RIA Systems vê

O plugin não tem telemetria, relatório de erros nem analytics. O diretório
da Anthropic nos mostra números agregados de uso (como instalações e a
frequência com que cada skill roda), que não incluem o conteúdo das suas
conversas.

Se você abrir uma issue ou um pull request no
[repositório do GitHub](https://github.com/riasistemas/claude-channel-instagram),
o que você escolher compartilhar ali é tratado pelo GitHub conforme a
[declaração de privacidade do GitHub](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

## Crianças e adolescentes

O plugin se destina a negócios e adultos. Ele não é direcionado a menores
de 18 anos.

## Alterações nesta política

As alterações ficam registradas no histórico git do repositório, e a data
no topo indica a mais recente.

## Contato

RIA SYSTEMS LTDA, CNPJ 50.936.395/0001-07, Rua Cardeal Arcoverde, 2365, Conj. 33, Parte, Pinheiros, São Paulo/SP, CEP 05407-003, Brasil.

- Privacidade: suporte@riasistemas.com.br. Este endereço é o nosso
  canal para pedidos sobre proteção de dados (LGPD, art. 41, § 2º).
- Issues no GitHub: https://github.com/riasistemas/claude-channel-instagram/issues

Foro de São Paulo, lei brasileira.
