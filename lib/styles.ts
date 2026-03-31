export interface StylePreset {
  id: string
  name: string
  description: string
  transforms: {
    formalReplacements?: [string, string][]
    prefixPhrases?: string[]
    suffixPhrases?: string[]
  }
}

export const stylePresets: StylePreset[] = [
  {
    id: 'formal',
    name: 'Formal',
    description: 'Professional, corporate language',
    transforms: {
      formalReplacements: [
        ['we', 'one'],
        ['you', 'one'],
        ["don't", 'do not'],
        ["can't", 'cannot'],
        ["won't", 'will not'],
        ["it's", 'it is'],
        ["that's", 'that is'],
        ["there's", 'there is'],
        ['gonna', 'going to'],
        ['wanna', 'want to'],
        ['gotta', 'have to'],
        ['kind of', 'somewhat'],
        ['sort of', 'somewhat'],
        ['a lot', 'significantly'],
        ['lots of', 'numerous'],
        ['really', 'considerably'],
        ['pretty', 'fairly'],
        ['basically', 'fundamentally'],
        ['actually', 'in fact'],
        ['stuff', 'materials'],
        ['things', 'items'],
        ['big', 'substantial'],
        ['small', 'modest'],
        ['good', 'favorable'],
        ['bad', 'unfavorable'],
        ['great', 'excellent'],
        ['awesome', 'exceptional'],
        ['amazing', 'remarkable']
      ]
    }
  },
  {
    id: 'friendly',
    name: 'Friendly',
    description: 'Warm, conversational tone',
    transforms: {
      formalReplacements: [
        ['one must', 'you should'],
        ['it is recommended', "we'd suggest"],
        ['please note', 'just a heads up'],
        ['however', 'but'],
        ['therefore', 'so'],
        ['furthermore', 'also'],
        ['in conclusion', 'to wrap up'],
        ['regarding', 'about'],
        ['utilize', 'use'],
        ['implement', 'set up'],
        ['facilitate', 'help with'],
        ['endeavor', 'try'],
        ['commence', 'start'],
        ['terminate', 'end'],
        ['sufficient', 'enough'],
        ['approximately', 'about'],
        ['subsequently', 'then'],
        ['nevertheless', 'still']
      ],
      prefixPhrases: [
        "Here's the thing - ",
        "So, ",
        "Alright, ",
        "Let's dive in - "
      ]
    }
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Imaginative, playful language',
    transforms: {
      formalReplacements: [
        ['good', 'brilliant'],
        ['great', 'fantastic'],
        ['important', 'game-changing'],
        ['new', 'fresh'],
        ['different', 'unique'],
        ['create', 'craft'],
        ['make', 'build'],
        ['use', 'leverage'],
        ['think', 'imagine'],
        ['see', 'envision'],
        ['change', 'transform'],
        ['improve', 'elevate'],
        ['start', 'spark'],
        ['begin', 'launch'],
        ['idea', 'concept'],
        ['plan', 'vision'],
        ['goal', 'mission'],
        ['problem', 'challenge'],
        ['solution', 'breakthrough']
      ],
      prefixPhrases: [
        "Picture this: ",
        "Imagine - ",
        "Here's where it gets exciting: "
      ]
    }
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Precise, structured language',
    transforms: {
      formalReplacements: [
        ['think', 'posit'],
        ['show', 'demonstrate'],
        ['use', 'utilize'],
        ['find', 'ascertain'],
        ['start', 'commence'],
        ['end', 'conclude'],
        ['look at', 'examine'],
        ['make', 'construct'],
        ['change', 'modify'],
        ['try', 'attempt'],
        ['help', 'facilitate'],
        ['need', 'require'],
        ['get', 'obtain'],
        ['give', 'provide'],
        ['keep', 'maintain'],
        ['seem', 'appear'],
        ['part', 'component'],
        ['way', 'method'],
        ['thing', 'element'],
        ['kind', 'type'],
        ['about', 'approximately'],
        ['now', 'currently'],
        ['before', 'previously'],
        ['after', 'subsequently']
      ],
      prefixPhrases: [
        "It is worth noting that ",
        "Research indicates that ",
        "Evidence suggests that "
      ]
    }
  }
]

export function getStyle(id: string): StylePreset | undefined {
  return stylePresets.find(s => s.id === id)
}

export function applyStyle(text: string, styleId: string): string {
  const style = getStyle(styleId)
  if (!style) return text
  
  let result = text
  
  // Apply word replacements
  if (style.transforms.formalReplacements) {
    for (const [from, to] of style.transforms.formalReplacements) {
      // Case-insensitive replacement preserving case
      // Only match whole words that are NOT followed by an apostrophe
const regex = new RegExp(`\\b${from}\\b(?!')`, 'gi')
result = result.replace(regex, (match) => {
  if (match[0] === match[0].toUpperCase()) {
    return to.charAt(0).toUpperCase() + to.slice(1)
  }
  return to
})
    }
  }
  
  return result
}
