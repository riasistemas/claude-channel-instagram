# Política de Privacidad

[English](PRIVACY.md) · [Português](PRIVACY.pt.md) · Español

Última actualización: 2026-11-21

Esta política describe cómo el **plugin `instagram`** (el "plugin") y el
conector de Instagram que utiliza (el "conector") tratan los datos. Se
aplica a quien instala y usa el plugin en claude.ai, en las apps de Claude
para escritorio y móvil, en Cowork o en Claude Code.

El plugin es software de código abierto distribuido bajo la licencia
Apache-2.0. El plugin y el conector los mantiene RIA SYSTEMS LTDA ("RIA
Systems").

## Resumen

- El plugin es un conjunto de instrucciones (skills) para Claude más la
  dirección de un servidor remoto, el conector en
  `https://mcp.lia.im/instagram`. No ejecuta nada en tu equipo.
- Si no conectas Instagram, nada sale de tu conversación con Claude: lo
  que pegas lo trata Anthropic según los términos y la política de
  privacidad de tu cuenta de Claude.
- Si conectas Instagram, RIA Systems guarda el ID y el nombre de usuario
  de la cuenta, los permisos concedidos y un token de acceso de Instagram
  cifrado, además de los mensajes directos de las cuentas conectadas, lo
  que aceptas en la pantalla de conexión. Para esas conversaciones RIA
  Systems actúa como encargado del tratamiento en tu nombre y las usa solo
  para mostrar el historial a Claude y, si lo contratas, para las
  respuestas de Lia. Los comentarios se leen en Meta solo cuando se ejecuta
  una herramienta y no se guardan.

## Sin el conector

Cuando usas `/instagram:inbox` con una conversación o una captura pegada,
se queda en esa conversación con Claude. El plugin no la envía a ningún
otro lugar, no inicia sesión en Instagram y no llama a las API de Meta.

## Con el conector

Te conectas iniciando sesión con Instagram desde Claude, mediante la app
"RIA Social" de RIA Systems en Meta. Tú eliges qué permisos conceder. Usar
el conector significa aceptar los
[Términos del Conector](TERMS.es.md), de los que esta política forma
parte.

**Roles**

Para las conversaciones y los datos de las personas que escriben a una
cuenta conectada, tú eres el responsable del tratamiento y RIA Systems es
el encargado: actuamos solo según tus instrucciones, para los fines aquí
descritos. Para los datos de tu propia cuenta (IDs, nombre de usuario,
token, registros de aceptación, registro de acciones) RIA Systems es el
responsable y los trata para prestar el conector y llevar el registro de
lo autorizado. Se aplica la ley brasileña (LGPD, Ley 13.709/2018). Si estás
en la Unión Europea o en el Reino Unido, también se aplica el RGPD, con los
mismos derechos y el mismo contacto.

**Qué guarda el conector**

- El ID y el nombre de usuario de tu cuenta profesional de Instagram y los
  permisos que concediste.
- El token de acceso que emite Meta, cifrado con una clave que solo usa el
  conector, para llamar a Meta en tu nombre.
- Un registro de cada app de Claude que autorizaste (cuándo se conectó y
  cuándo se usó por última vez), para que puedas ver y revocar el acceso.
- Cuándo y en qué versión aceptaste, para cada cuenta conectada, que se
  guarden sus conversaciones.
- Un registro de cada acción que Claude hizo en tu nombre (DM enviado,
  respuesta a un comentario, respuesta privada, comentario ocultado): qué
  cuenta, qué herramienta, cuándo y los IDs de Instagram involucrados. No
  incluye el texto.
- Los mensajes directos de cada cuenta conectada, recibidos y enviados,
  incluido el ID de quien escribió en el ámbito de Instagram, como se
  describe más abajo.
- Datos técnicos de corta duración para cumplir los límites de envío de
  Meta y evitar envíos duplicados.

**Tus conversaciones**

La pantalla de conexión te informa de que RIA Systems guarda los mensajes
directos de las cuentas conectadas. Una vez que aceptas, Meta entrega a
RIA Systems cada DM que la cuenta recibe o envía (desde Claude o desde la
app de Instagram), y RIA Systems lo guarda en tu cuenta de RIA Systems. Se
usan para mostrar el historial a Claude y, solo si más adelante activas
las respuestas automáticas de Lia (un servicio de pago aparte), para que
Lia pueda responder. Activarlas no te pide una nueva aceptación; las
respuestas solo empiezan cuando contratas el servicio. Si contratas Lia,
los Términos, la Política de Privacidad y el DPA de Lia
([lia.im/termos](https://lia.im/termos),
[lia.im/privacidade](https://lia.im/privacidade),
[lia.im/dpa](https://lia.im/dpa)) rigen las respuestas automáticas; el rol
de RIA Systems sigue siendo el mismo: encargado del tratamiento en tu
nombre. Los archivos multimedia no se descargan: solo se guarda el tipo de
adjunto.

Los comentarios, los textos de las publicaciones y los nombres de quienes
los escribieron se obtienen de Meta cuando se ejecuta una herramienta, se
pasan a tu conversación con Claude y no se guardan. Ningún contenido de
mensajes o comentarios se escribe en los registros técnicos.

Las conversaciones se guardan mientras la cuenta siga conectada y en uso.
Cuando eliminas la cuenta, o eliminas "RIA Social" en Instagram, el token
de acceso se borra de inmediato y las conversaciones en un plazo de 30
días; si durante 30 días no hay ninguna app de Claude autorizada ni Lia
contratada, dejamos de recibir mensajes y borramos los guardados. Los
registros de aceptación y el registro de acciones (que no contienen texto
de mensajes) se conservan 5 años con fines legales. Puedes pedir que se
borren las conversaciones en cualquier momento (consulta "Desconexión y
eliminación").

**Qué envía**

Solo las respuestas, respuestas privadas o acciones de ocultar/mostrar que
hace una llamada a una herramienta, y que las skills te piden aprobar
antes. Se aplican las reglas de Meta: hasta 24 horas después del último
mensaje del cliente, hasta 1000 bytes, solo texto.

**Quién más recibe datos**

- Meta, que opera Instagram y su API, según sus propios términos.
- Anthropic, que opera Claude: los resultados de las herramientas pasan a
  formar parte de tu conversación con Claude, según los términos y la
  política de privacidad de tu cuenta de Claude.
- Nuestros proveedores de alojamiento, que guardan los datos en nuestro
  nombre: Google Cloud, en Estados Unidos (us-central1), con copias de
  seguridad en Google Cloud y Amazon Web Services. Esta transferencia
  internacional se apoya en las cláusulas contractuales tipo de los
  proveedores (LGPD, art. 33). Google Cloud (Google LLC) y Amazon Web
  Services, Inc. participan en el Marco de Privacidad de Datos UE-EE. UU.
  y su extensión para el Reino Unido, o proporcionan las cláusulas
  contractuales tipo de la UE; las transferencias desde la UE/EEE a RIA en
  Brasil se apoyan en la decisión de adecuación de la Comisión Europea
  para Brasil (Decisión de Ejecución (UE) 2026/179).

RIA Systems no vende estos datos, no los usa para publicidad ni
prospección y no los usa para entrenar modelos de IA.

**Desconexión y eliminación**

Eliminar una cuenta en la pantalla de conexión, o eliminar "RIA Social" en
Instagram → Configuración → Permisos del sitio web → Apps y sitios web,
borra el token de acceso de inmediato y las conversaciones guardadas en un
plazo de 30 días (ver arriba). Desconectar el conector en la configuración
de conectores de Claude o en `/mcp` solo revoca el acceso de esa app de
Claude. También puedes escribir a la dirección de privacidad de abajo:
confirmamos en un plazo de 2 días hábiles y completamos la eliminación en
un plazo de 15 días. Las solicitudes de eliminación de datos de Meta se
tramitan automáticamente, con un código de confirmación.

## Datos de otras personas

Las conversaciones y los comentarios de Instagram contienen datos
personales de otras personas. Conecta solo una cuenta que administres y
pega solo lo que puedas compartir. Para las conversaciones que guarda, RIA
Systems trata los datos de tus clientes en tu nombre; tú sigues siendo
responsable de tener una base legal para guardarlos y responderlos. Las
skills piden a Claude que no repita más de esos datos de lo que necesita
una respuesta.

Si escribiste a una cuenta conectada y quieres que se borren tus datos,
contacta con el titular de esa cuenta: actuamos según sus instrucciones y
le ayudaremos. Nunca contactamos por nuestra cuenta a los clientes de una
cuenta conectada.

## Seguridad e incidentes

El token de acceso se guarda cifrado, con una clave que solo usa el
conector; el acceso a las conversaciones guardadas está restringido al
conector y, si lo contratas, a Lia. Si un incidente de seguridad afecta a
tus datos, te avisamos y, cuando corresponda, avisamos a la autoridad
brasileña de protección de datos (ANPD).

## Qué más ve RIA Systems

El plugin no tiene telemetría, informes de errores ni analítica. El
directorio de Anthropic nos muestra cifras agregadas de uso (como
instalaciones y la frecuencia con que se ejecuta cada skill), que no
incluyen el contenido de tus conversaciones.

Si abres un issue o un pull request en el
[repositorio de GitHub](https://github.com/riasistemas/claude-channel-instagram),
lo que decidas compartir allí lo trata GitHub según la
[declaración de privacidad de GitHub](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

## Menores

El plugin está pensado para negocios y adultos. No está dirigido a menores
de 18 años.

## Cambios en esta política

Los cambios quedan registrados en el historial git del repositorio, y la
fecha de arriba indica el más reciente.

## Contacto

RIA SYSTEMS LTDA, CNPJ 50.936.395/0001-07, Rua Cardeal Arcoverde, 2365, Conj. 33, Parte, Pinheiros, São Paulo/SP, CEP 05407-003, Brasil.

- Privacidad: suporte@riasistemas.com.br. Esta dirección es nuestro
  canal para solicitudes de protección de datos (LGPD, art. 41, § 2º).
- Issues en GitHub: https://github.com/riasistemas/claude-channel-instagram/issues

Tribunales de São Paulo, ley brasileña.
