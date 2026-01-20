// ABOUTME: Onboarding screen for first-time users.
// ABOUTME: Three-page swipeable tutorial explaining golf tempo training concepts.

import { useCallback, useState, useRef } from 'react'
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
  type ViewToken,
} from 'react-native'
import { router } from 'expo-router'

import { colors, fontSizes, spacing } from '../constants/theme'
import { useSettingsStore } from '../stores/settingsStore'

interface OnboardingPage {
  id: string
  title: string
  content: string[]
}

const ONBOARDING_PAGES: OnboardingPage[] = [
  {
    id: 'tempo',
    title: 'What is Golf Tempo?',
    content: [
      'Tour pros complete their swing in under 1.2 seconds with a consistent 3:1 backswing to downswing ratio.',
      'Training with a metronome helps you develop muscle memory for this timing.',
    ],
  },
  {
    id: 'tones',
    title: 'Three Simple Tones',
    content: [
      'Tone 1: Start takeaway',
      'Tone 2: Start downswing',
      'Tone 3: Impact',
      'Match your swing to the tones to groove perfect tempo.',
    ],
  },
  {
    id: 'start',
    title: 'Start with 24/8',
    content: [
      'This is the most common tempo for full swings.',
      'Practice 10-15 reps, focusing on matching the tones rather than swing mechanics.',
    ],
  },
]

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const VIEWABILITY_CONFIG = {
  viewAreaCoveragePercentThreshold: 50,
}

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding)

  const handleComplete = useCallback(() => {
    completeOnboarding()
    router.replace('/(tabs)')
  }, [completeOnboarding])

  const handleNext = useCallback(() => {
    if (currentPage < ONBOARDING_PAGES.length - 1) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      flatListRef.current?.scrollToIndex({ index: nextPage, animated: true })
    }
  }, [currentPage])

  const handleBack = useCallback(() => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1
      setCurrentPage(prevPage)
      flatListRef.current?.scrollToIndex({ index: prevPage, animated: true })
    }
  }, [currentPage])

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentPage(viewableItems[0].index)
      }
    },
    []
  )

  const isLastPage = currentPage === ONBOARDING_PAGES.length - 1

  const renderPage = ({ item }: ListRenderItemInfo<OnboardingPage>) => (
    <View style={styles.pageContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        {item.content.map((line, index) => (
          <Text key={index} style={styles.contentText}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  )

  return (
    <View style={styles.container} testID="onboarding-screen">
      <View style={styles.skipContainer}>
        <Text
          style={styles.skipText}
          onPress={handleComplete}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          Skip
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        testID="onboarding-flatlist"
        data={ONBOARDING_PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {ONBOARDING_PAGES.map((_, index) => (
            <Pressable
              key={index}
              testID={`page-indicator-${index}`}
              style={[styles.indicator, currentPage === index && styles.indicatorActive]}
              accessibilityRole="button"
              accessibilityLabel={`Page ${index + 1} of ${ONBOARDING_PAGES.length}`}
              accessibilityState={{ selected: currentPage === index }}
              onPress={() => flatListRef.current?.scrollToIndex({ index, animated: true })}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {currentPage > 0 && (
            <Text
              style={styles.backButton}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go to previous page"
            >
              Back
            </Text>
          )}

          <Text
            style={styles.nextButton}
            onPress={isLastPage ? handleComplete : handleNext}
            accessibilityRole="button"
            accessibilityLabel={
              isLastPage ? 'Complete onboarding and start app' : 'Go to next page'
            }
          >
            {isLastPage ? 'Get Started' : 'Next'}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipContainer: {
    position: 'absolute',
    top: spacing.xl + spacing.lg,
    right: spacing.lg,
    zIndex: 1,
  },
  skipText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  pageContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  contentContainer: {
    alignItems: 'center',
    maxWidth: 320,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  contentText: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
    lineHeight: 28,
  },
  footer: {
    paddingBottom: spacing.xl + spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.inactive,
    marginHorizontal: spacing.xs,
  },
  indicatorActive: {
    backgroundColor: colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
  },
  backButton: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  nextButton: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
})
