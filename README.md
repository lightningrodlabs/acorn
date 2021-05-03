# Acorn
## built with Holochain

To set up fresh: 

__dna__
- Have rust language (stable) installed on your system
- run `npm run install-hc-tools`
- run `npm run pack-happ`

__web__ (user interface)

- in a separate terminal than `dna` commands
- Use nodejs version 14
- run `npm install`
- run `npm run install-ui`
- run `npm run run-ui`
- Open up http://localhost:8080/ OR to view in Electron, run `npm start`

To test backend:
- run `npm run test-happ`

If you make changes to back/crates or back/zomes, you will need to restart your database from scratch: 
- stop a running `npm run run-happ` service
- delete `databases` folder
- run `npm run pack-happ`
- restart the `run-happ` service with `npm run run-happ`
- in a separate terminal, run `npm run install-happ`
- you can now reload your UI and check out your new code, you do not need to restart your UI/front



