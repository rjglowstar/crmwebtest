# `CRM.Web`

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.1.6.

# Project quick overview

Basically there is 3 sub-projects in **`CRM.Web`** repository.

- **CRM.Admin**
- **CRM.Supplier**
- **CRM.Customer**

we already made some common folder for the multiple time using file you can check those thing in below.
```sh
root/assets
root/common
root/enviroments
```

For more detail about folder structure you can go :

```sh
root/doc/CRM.Web.docx
```

> **Note:** If you made any changes on the folder structure you need to update the above document file as well. 

## Installation

**CRM[Dot]Web** requires [Node.js](https://nodejs.org/) v10+ to run.

Install the dependencies and devDependencies and start the server.

```sh
cd CRM.Web
npm install
```

## Development server

- #### For CRM.Admin 
    Run `ng serve CRM.Admin` for a dev server. Navigate to `http://localhost:4200/`. 

- #### For CRM.Supplier 
    Run `ng serve CRM.Supplier` for a dev server. Navigate to `http://localhost:8200/`. 

- #### For CRM.Customer 
    Run `ng serve CRM.Customer` for a dev server. Navigate to `http://localhost:9200/`. 

The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

- #### for CRM.Admin 

    Run `ng build --prod --project="CRM.Admin"`

- #### for CRM.Supplier 

    Run `ng build --prod --project="CRM.Supplier"`
    
- #### for CRM.Customer 

    Run `ng build --prod --project="CRM.Customer"`    
    
## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

# Reference link

 [**Link**](https://www.tektutorialshub.com/angular/angular-multiple-apps-in-one-project/)

