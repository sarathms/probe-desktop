import React, { useState } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Text } from 'rebass'
import {
  Container,
  Flex,
  Box,
  Heading,
  Button
} from 'ooni-components'
import { FormattedMessage } from 'react-intl'
import { Tick } from 'ooni-components/dist/icons'
import { MdPriorityHigh } from 'react-icons/md'

import { tests } from '../nettests'
import BackButton from '../BackButton'
import { StickyContainer, Sticky } from 'react-sticky'

import { WebConnectivity } from '../nettests/websites/WebConnectivity'
import { HttpHeaderFieldManipulation } from '../nettests/middleboxes/HttpHeaderFieldManipulation'
import { HttpInvalidRequestLine } from '../nettests/middleboxes/HttpInvalidRequestLine'
import { FacebookMessenger } from '../nettests/im/FacebookMessenger'
import { Telegram } from '../nettests/im/Telegram'
import { WhatsApp } from '../nettests/im/WhatsApp'
import { NDT } from '../nettests/performance/NDT'
import { Dash } from '../nettests/performance/Dash'
import { Psiphon } from '../nettests/circumvention/Psiphon'
import { Tor } from '../nettests/circumvention/Tor'

import FullHeightFlex from '../FullHeightFlex'
import MethodologyButton from './MethodologyButton'
import ExplorerURLButton from './ExplorerURLButton'
import RawDataContainer from './RawDataContainer'
import colorMap from '../colorMap'

const detailsMap = {
  web_connectivity: WebConnectivity,
  http_header_field_manipulation: HttpHeaderFieldManipulation,
  http_invalid_request_line: HttpInvalidRequestLine,
  facebook_messenger: FacebookMessenger,
  telegram: Telegram,
  whatsapp: WhatsApp,
  ndt: NDT,
  dash: Dash,
  psiphon: Psiphon,
  tor: Tor
}

const HeroItemBox = ({ label, content, ...props }) => (
  <Box p={3} {...props}>
    <Text fontSize={24} fontWeight={300}>{content}</Text>
    <Text fontSize={16} fontWeight={600}>{label}</Text>
  </Box>
)

HeroItemBox.propTypes = {
  label: PropTypes.node,
  content: PropTypes.node
}

const HeroLineItem = ({ size, fontWeight, children }) => (
  <Flex justifyContent='center' my={3}>
    <Text fontSize={size} fontWeight={fontWeight}>
      {children}
    </Text>
  </Flex>
)

HeroLineItem.propTypes = {
  size: PropTypes.number,
  children: PropTypes.node
}

const StickyHero = ({
  isSticky,
  isAnomaly,
  bg,
  testName,
  startTime,
  networkName,
  asn,
  hero,
  heroIcon,
  heroTitle,
  heroSubtitle
}) => {
  const testFullName = tests[testName].name

  let backgroundColor = bg
  // If there is no bg override, determine color based on anomaly-ness
  if (!backgroundColor) {
    backgroundColor = isAnomaly ? colorMap.anomaly : colorMap.reachable
  }

  if (!heroIcon) {
    heroIcon = isAnomaly ? <MdPriorityHigh /> : <Tick />
  }

  if (isSticky) {
    return (
      <Flex bg={backgroundColor} color='white' alignItems='center'>
        <Box><BackButton /></Box>
        <Box><Heading textAlign='center' h={4}>{testFullName}</Heading></Box>
      </Flex>
    )
  } else {
    return (
      <Flex flexDirection='column' bg={backgroundColor} color='white'>
        <Box width={1}>
          <Flex>
            <Box>
              <BackButton />
            </Box>
            <Box width={7/8}>
              <Heading textAlign='center' h={4}>{testFullName}</Heading>
            </Box>
          </Flex>
        </Box>
        {hero ? (
          // If a test wants to show a custom Hero, let it take over
          hero
        ) : (
          <React.Fragment>
            <Box width={1}>
              <HeroLineItem size={60}>{heroIcon}</HeroLineItem>
              <HeroLineItem size={24} fontWeight={900}>{heroTitle}</HeroLineItem>
              <HeroLineItem size={16}>{heroSubtitle}</HeroLineItem>
            </Box>
            <Box width={1}>
              <Flex flexWrap='wrap' alignItems='center'>
                <HeroItemBox
                  width={1/2}
                  label={<FormattedMessage id='TestResults.Summary.Hero.DateAndTime' />}
                  content={moment.utc(new Date(startTime)).format('lll')}
                />
                <HeroItemBox
                  width={1/2}
                  label={<FormattedMessage id='TestResults.Summary.Hero.Network' />}
                  content={`${networkName} (AS${asn})`}
                />
              </Flex>
            </Box>
          </React.Fragment>
        )}
      </Flex>
    )
  }
}

const MeasurementDetailContainer = ({ measurement, ...props }) => {
  const TestDetails = detailsMap[measurement.test_name]
  return (
    <TestDetails measurement={measurement} {...props} />
  )
}

MeasurementDetailContainer.propTypes = {
  measurement: PropTypes.object
}

const MeasurementContainer = ({measurement, isAnomaly, rawData}) => {
  const testName = measurement.test_name
  const startTime = measurement.start_time
  const networkName = measurement.network_name
  const asn = measurement.asn
  const runtime = measurement.runtime

  const [rawDataOpen, setRawDataOpen] = useState(false)

  return (
    <React.Fragment>
      <MeasurementDetailContainer
        isAnomaly={isAnomaly}
        measurement={measurement}
        render={({
          hero,
          heroBG,
          heroIcon,
          heroTitle,
          heroSubtitle,
          collapsedHero,
          details
        }) => (
          <StickyContainer>
            <Sticky topOffset={100}>
              {({
                style,
                isSticky
              }) => {
                return (
                  <Box style={style}>
                    <StickyHero
                      isSticky={isSticky}
                      isAnomaly={isAnomaly}
                      bg={heroBG}
                      testName={testName}
                      startTime={startTime}
                      networkName={networkName}
                      asn={asn}
                      hero={hero}
                      heroIcon={heroIcon}
                      heroTitle={heroTitle}
                      heroSubtitle={heroSubtitle}
                      collapsedHero={collapsedHero}
                    />
                  </Box>
                )
              }}
            </Sticky>
            <Container>
              <Flex flexDirection='column' style={{ 'minHeight': '60vh' }}>
                <Flex my={3} alignItems='center'>
                  <Box width={1/2}>
                    <Text fontWeight='bold' is='span'>
                      <FormattedMessage id='TestResults.Details.Hero.Runtime' />
                    </Text>
                    : {moment.duration(runtime * 1000).seconds()}s
                  </Box>
                  <Box ml='auto'>
                    <MethodologyButton href={tests[testName].methodology} />
                  </Box>
                </Flex>
                <FullHeightFlex>
                  {details}
                </FullHeightFlex>
                <Flex my={3}>
                  <Box mr='auto'>
                    <Button onClick={() => setRawDataOpen(!rawDataOpen)}>
                      <FormattedMessage id='TestResults.Details.RawData' />
                    </Button>
                  </Box>
                  {
                    rawData && measurement.is_uploaded &&
                    <ExplorerURLButton
                      reportID={rawData.report_id}
                      input={rawData.input}
                    />
                  }
                </Flex>
              </Flex>
            </Container>
          </StickyContainer>
        )}
      />
      <RawDataContainer
        rawData={rawData}
        isOpen={rawDataOpen}
        onClose={() => setRawDataOpen(false)}
      />
    </React.Fragment>
  )
}

MeasurementContainer.propTypes = {
  measurement: PropTypes.object,
  isAnomaly: PropTypes.bool,
  rawData: PropTypes.object
}

export default MeasurementContainer
