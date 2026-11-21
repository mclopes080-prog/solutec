# Imagens dos produtos

As fotos originais (`assets/img/*.webp` do projeto antigo) **não estão em nenhum repositório**. Coloque os arquivos nesta pasta com os nomes abaixo. São os caminhos gravados pelo seed (`backend/prisma/seed.ts`) no campo `imagemUrl`:

| Produto | Arquivo esperado | `imagemUrl` |
|---|---|---|
| Câmera IP Externa HD | `camera-ip-externa.webp` | `/img/produtos/camera-ip-externa.webp` |
| Câmera Dome Interna | `camera-dome.webp` | `/img/produtos/camera-dome.webp` |
| Kit 4 Câmeras + DVR | `kit-4-cameras-dvr.webp` | `/img/produtos/kit-4-cameras-dvr.webp` |
| Câmera 360° WiFi | `camera-360-wifi.webp` | `/img/produtos/camera-360-wifi.webp` |
| Alarme Residencial Completo | `alarme-residencial.webp` | `/img/produtos/alarme-residencial.webp` |
| Sensor de Presença | `sensor-de-presenca.webp` | `/img/produtos/sensor-de-presenca.webp` |
| Controle de Acesso Biométrico | `controle-de-acesso-biometrico.webp` | `/img/produtos/controle-de-acesso-biometrico.webp` |
| Central de Monitoramento | `central-de-monitoramento.webp` | `/img/produtos/central-de-monitoramento.webp` |

Os nomes originais tinham espaços e `+` (ex.: `camera ip externa.webp`); foram trocados por hífens para funcionar em URL sem codificação.

Enquanto um arquivo não existir, o frontend mostra `placeholder.svg` automaticamente (componente `ImagemComFallback`). Formato recomendado: `.webp`, proporção 4:3, cerca de 800×600 px.
