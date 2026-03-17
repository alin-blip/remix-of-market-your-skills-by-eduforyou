/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

const LOGO_URL = 'https://fdjzjqkiuxygiemqyfim.supabase.co/storage/v1/object/public/email-assets/logo.png'

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Resetează-ți parola pentru Freedom Launcher</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="Freedom Launcher" width="160" height="auto" style={{ marginBottom: '24px' }} />
        <Heading style={h1}>Resetează-ți parola</Heading>
        <Text style={text}>
          Am primit o cerere de resetare a parolei pentru contul tău Freedom Launcher. Apasă butonul de mai jos pentru a alege o parolă nouă.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Resetează Parola →
        </Button>
        <Text style={footer}>
          Dacă nu ai solicitat resetarea parolei, poți ignora acest email. Parola ta nu va fi schimbată.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 28px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#0D1B2A',
  margin: '0 0 20px',
  fontFamily: "'Playfair Display', Georgia, serif",
}
const text = {
  fontSize: '15px',
  color: '#6B7A8D',
  lineHeight: '1.6',
  margin: '0 0 24px',
}
const button = {
  backgroundColor: '#D4A843',
  color: '#0D1B2A',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
