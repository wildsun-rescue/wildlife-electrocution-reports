# Wildlife Electrocution Reports

This is the source code for the wildsun wildlife electrocution reporting netlify server.

## Dev Environment

1. Install NodeJS and Netlify
2. Git Clone this repo and run `yarn`
3. Run `yarn dev`

The new report hook is now available at:

http://localhost:34567/new-report-hook?auth=YOUR_AUTH_TOKEN

(replace YOUR_AUTH_TOKEN with the shared secret static auth token that can be found in netlify's environment variables)

###  Integration Test

Once `yarn dev` is started run:

`STATIC_AUTH_TOKEN=YOUR_AUTH_TOKEN yarn test`

in a second terminal to submit a mock form submission (replacing YOUR_AUTH_TOKEN with the shared secret static auth token that can be found in netlify's environment variables).

**Warning:** The Integration test will update the production Google  Sheet and send out text messages to managers. Please alert management to your testing and make sure you have access to the spreadsheet so you can delete test rows before running a test.

### Deploying to Production

Any code pushed to the github master branch will automatically be deployed to production by netlify.
