# Hibori

## Signin new versions

```powershell
$cert = New-SelfSignedCertificate -Subject "Hibori" -Type CodeSigningCert -KeyUsage DigitalSignature -FriendlyName "Hibori"
$password = ConvertTo-SecureString -String "qsxft129" -Force -AsPlainText
signtool sign /a /fd SHA256 /td SHA256 /tr http://timestamp.digicert.com /f cert.pfx /p qsxft129 "Exe file here.exe"
```