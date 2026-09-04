# Distribuição e atualização automática (Windows)

O Quality Certifier passa a ser distribuído por um instalador NSIS
(`Quality-Certifier-Setup-<versão>.exe`) publicado no GitHub Releases do repositório
`luizzVictorino/quality-certifier`. A partir da primeira instalação por esse instalador,
as próximas versões chegam automaticamente pelo `electron-updater`.

## Desenvolvimento

```bash
npm install
npm run dev            # aplicação web (desenvolvimento)
npm run build:desktop  # build estático usado pelo executável
npm run desktop:start  # abre a janela Electron com o build estático
```

## Build local do Windows

```bash
npm run dist:win
```

Saída em `dist-desktop/`:

```
Quality-Certifier-Setup-1.0.0.exe     (instalador NSIS — formato oficial)
Quality-Certifier-Portable-1.0.0.exe  (portátil — sem atualização automática)
latest.yml                            (metadados lidos pelo electron-updater)
```

## Publicar uma nova versão

```bash
# 1. alterar o código
# 2. atualizar a versão (semver) no package.json
npm version 1.0.1 --no-git-tag-version
git add -A && git commit -m "release: v1.0.1"
git push
git tag v1.0.1
git push origin v1.0.1
```

O workflow `.github/workflows/release.yml` roda no `windows-latest`, valida que a tag bate
com o `package.json`, gera o instalador e publica a Release usando o `GITHUB_TOKEN` do
próprio Actions (nenhum token fica no código).

## Como o usuário final recebe a atualização

1. Abre o Quality Certifier (a abertura nunca espera pela internet).
2. Em segundo plano, ~4s após iniciar, o app consulta o GitHub Releases.
3. Havendo nova versão, aparece o aviso "Nova atualização disponível".
4. "Atualizar agora" baixa o instalador com barra de progresso.
5. "Reiniciar e atualizar" instala e reabre o app já na nova versão.

Também existe o botão **Verificar atualizações** no cabeçalho da aplicação.

Sem internet, GitHub fora do ar ou download interrompido: o app segue funcionando
normalmente e o erro apenas informa que não foi possível verificar/baixar.

## Testar o auto-update localmente

O updater fica desativado fora do pacote (`app.isPackaged === false`).

1. `npm version 1.0.0 --no-git-tag-version` → `npm run dist:win` → instale o Setup gerado.
2. `npm version 1.0.1 --no-git-tag-version` → `npm run dist:win:publish` (ou crie a tag
   `v1.0.1` e deixe o Actions publicar).
3. Abra a versão 1.0.0 instalada: o aviso de atualização deve aparecer em alguns segundos.
4. Logs em `%APPDATA%\CertificadoQualidade\logs\app.log` (`[Updater] ...`).

## Transição da versão ZIP

Usuários que hoje usam o ZIP portátil **não** migram sozinhos. Eles devem instalar uma
única vez o `Quality-Certifier-Setup-1.0.0.exe` (versão instalada nos computadores atuais
para iniciar o ciclo). A partir dessa instalação, todas as próximas versões são automáticas.
