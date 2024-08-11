Welcome to our Yeti AI (AI-Customer-Support) project. This is the Team project for third week of the Headstarter AI fellowship.

The Tech stack used :

```bash
1. NextJS: A React-based framework for building server-side rendered (SSR) and statically generated websites and applications.

2. NodeJS: A JavaScript runtime environment for executing server-side code.

3. Firebase:
  a.Firebase Database: A NoSQL cloud-hosted database for storing and retrieving  data.
  b.Firebase Auth: A authentication and authorization system for managing user identities.
  Firebase Storage: A cloud-based storage solution for storing and serving files(Image).

4.Gemini (via @google/generative-ai package): A generative AI model for chatbots and conversational interfaces(gemini-1.5-pro Model).

```

## Setting up the projet

Step 1: Clone the repository to your local directory of choice
Step 2: Use 
```bash
npm install
```
Step 3: Install the package for using Gemini in your chat
```bash
npm install @google/generative-ai
```
Step 4: 

Finally, you need to set your API key for this follow the following:


    1. Get your api key from https://aistudio.google.com/app/apikey
    2. Create a folder in your root directory named  ```.env.local```
    3. Inside ```.env.local``` add following line
        ```GEMINI_API_KEY= your api key```

Step 5:

Now you can host locally at http://localhost:3000/:

```bash
npm run dev
```




