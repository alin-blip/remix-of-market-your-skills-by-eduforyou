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
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

const LOGO_URL = 'https://fdjzjqkiuxygiemqyfim.supabase.co/storage/v1/object/public/email-assets/logo.png'

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Confirmă-ți emailul pentru Freedom Launcher</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="Freedom Launcher" width="160" height="auto" style={{ marginBottom: '24px' }} />
        <Heading style={h1}>Confirmă-ți adresa de email</Heading>
        <Text style={text}>
          Mulțumim că te-ai înregistrat pe{' '}
          <Link href={siteUrl} style={link}>
            <strong>Freedom Launcher</strong>
          </Link>
          !
        </Text>
        <Text style={text}>
          Te rugăm să confirmi adresa de email (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) apăsând butonul de mai jos:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Verifică Email →
        </Button>
        <Text style={footer}>
          Dacă nu ai creat un cont, poți ignora acest email în siguranță.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
const link = { color: '#D4A843', textDecoration: 'underline' }
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
