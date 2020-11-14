import React, { useState, useEffect, useMemo, useCallback } from 'react'
import * as Sentry from '@sentry/node'
import { createIntl, createIntlCache, RawIntlProvider } from 'react-intl'
import { getMessages, getLocale, getSupportedLanguages } from '../components/langUtils'

// Polyfill Intl.DisplayNames to display language names in the selected language
import '@formatjs/intl-displaynames/polyfill'

// This is optional but highly recommended
// since it prevents memory leak
// https://formatjs.io/docs/react-intl/components#rawintlprovider
const cache = createIntlCache()

Sentry.init({
  dsn: 'https://e1eef2aaa6054d94bffc4a648fb78f09@sentry.io/1210892',
})

const MyApp = ({ Component, pageProps, router, err }) => {

  // Workaround for https://github.com/zeit/next.js/issues/8592
  const modifiedPageProps = { ...pageProps, err }
  const { query : { lang } } = router

  const locale = lang || getLocale()
  const [activeLang, activateLang] = useState(locale)
  const [localeDataToLoad, setLocaleDataToLoad] = useState(locale)

  const intl = useMemo(() => {
    const messages = getMessages(activeLang)
    return createIntl({ locale: activeLang, messages }, cache)
  }, [activeLang])

  const changeLocale = useCallback((locale) => {
    // Before activating the locale, load locale-data
    setLocaleDataToLoad(locale)
  }, [activateLang, setLocaleDataToLoad])

  // Insert method to set active Locale into the intl context
  // This will be available to components via the standard `useIntl` hook
  intl['setLocale'] = changeLocale

  useEffect(() => {
    if (typeof window !== 'undefined' && localeDataToLoad) {
      async function maybePolyfill(locale) {
        if (!getSupportedLanguages().includes(locale)) {
          locale = 'en'
        }

        if (Intl.DisplayNames.polyfilled) {
          await import(`@formatjs/intl-displaynames/locale-data/${locale}`)
          setLocaleDataToLoad(null)
          activateLang(locale)
        }
      }
      maybePolyfill(localeDataToLoad)
    }

  }, [localeDataToLoad, setLocaleDataToLoad])

  return (
    <RawIntlProvider value={intl}>
      <Component {...modifiedPageProps} />
    </RawIntlProvider>
  )
}

export default MyApp
