# Hibori

## Project explanation

This is a social media-like app with AI features. It uses AI to connect between users, with the goal
of allowing users to interact outside the app *without* pushing the users to do so.

## Project structure

The project is built on Tauri, with rust in the back and React in the front.

The structure goes like this:

- src
The source directory of the project. Uses Create-React-App (CRA)
and firebase for almost all features of the app.

In the src directory, there's the following subdirectories:

1. auth - The authentication pages
2. main - Every page that appears in the navbar, asides from settings
3. user - user related pages, mostly deprecated, except for settings
4. components - the layout components
5. api - the APIs for tauri, firebase, cloudinary etc

- src-tauri
The src directory mostly handles plugins, and has less features, since
most actions can be done safely from the client side.
However, the src-tauri directory can also be used to extend the app
with more difficult and complicated features.

## Running the code

Follow the tauri prerequisites:
https://tauri.app/start/prerequisites/

Then, login to the following services/APis:

Firebase
Google Gemini
Cloudinary

Fill in this .env file:

```dotenv
VITE_GEMINI_API_KEY="Insert Gemini API key"
VITE_FIREBASE_API_KEY="Firebase key"
VITE_AUTH_DOMAIN="Firebase domain"
VITE_PROJECT_ID="Firebase project id"
VITE_STORAGE_BUCKET="Firebase storage bucket"
VITE_MESSANGER_SENDER_ID="Firebase messaging"
VITE_APP_ID="Firebase ID"
VITE_MESSUREMENT_ID="Firebase Messurement ID"
VITE_CLODINARY_API_KEY='Cloudinary API key'
VITE_CLOUDINARY_API_SECRET="Cloudinary API secret"
VITE_CLOUDINARY_UPLOAD_PRESET="Cloudinary preset ('Default' reccomended)"
VITE_CLOUDINARY_NAME="Cloudinary api name"
CLOUDINARY_URL="Cloudinary URL"
```

Then, use ```npm i && npm run tauri dev``` and you should be able
to run the project!

## Signin new versions

```powershell
$cert = New-SelfSignedCertificate -Subject "Hibori" -Type CodeSigningCert -KeyUsage DigitalSignature -FriendlyName "Hibori"
$password = ConvertTo-SecureString -String "password" -Force -AsPlainText
signtool sign /a /fd SHA256 /td SHA256 /tr http://timestamp.digicert.com /f cert.pfx /p qsxft129 "Exe file here.exe"
```