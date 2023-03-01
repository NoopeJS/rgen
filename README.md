## The CLI for React Gen framowrok `rgen`

### Install the CLI globally in your machine
```bash
npm install -g @noopejs/rgen
```

### Setup your new React Gen app
```bash
rgen new app myApp
```

### Navigate to your new project and run development server
```bash
cd myApp && npm run dev
```

### Generate new module
```bash
rgen new module about
```

This command will generate the following files:
```
src/
-- about/
---- about.module.ts
---- about.service.ts
---- about.component.tsx
```

It's also possible to generate a single unit [moduleClass, service, moduleComponent] by specifying option as follows:
```bash
rgen new moduleClass about
```
```bash
rgen new service about
```
```bash
rgen new moduleComponent about
```