# Abundant Housing Vancouver Letter Builder

Surprise, it's our cool letter builder. It's an Angular 4 client-side web app and most of the configuration lives in a Google spreadsheet that is read using the tabletop.js library. It generates a letter using client input and passes it to the even cooler [AHV Council Thing](https://github.com/rlisagor/ahv-council-thing) system to be reviewed in Slack and then emailed.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.6. You should probably (read: definitely) install Angular CLI before trying to work with this.

## How to run a test version

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. To do a production build (smaller) without filename hashing (convenient b/c your script embed tags don't need to be updated): `ng build --target=production --output-hashing none`