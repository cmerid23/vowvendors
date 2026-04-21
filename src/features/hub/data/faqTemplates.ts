import type { FaqTemplate } from '../../../types/hub'

export const FAQ_TEMPLATES: Record<string, FaqTemplate[]> = {
  schedule: [
    {
      question: 'What is the date and time of the ceremony?',
      placeholder: 'The ceremony begins at [TIME] on [DATE]. Please arrive 15–20 minutes early to find your seat.',
    },
    {
      question: 'Where is the ceremony taking place?',
      placeholder: 'The ceremony will be held at [VENUE NAME], located at [ADDRESS].',
    },
    {
      question: 'Where is the reception taking place?',
      placeholder: 'The reception will follow the ceremony at [VENUE NAME], [ADDRESS]. It is a [X]-minute drive from the ceremony.',
    },
    {
      question: 'What time does the reception end?',
      placeholder: 'The reception will wrap up at approximately [TIME]. We want to make sure everyone gets home safely!',
    },
    {
      question: 'Will there be a gap between ceremony and reception?',
      placeholder: 'Yes, there will be approximately [X] hours between the ceremony and reception. We recommend [SUGGESTION — e.g. exploring the area, checking into your hotel].',
    },
  ],

  attire: [
    {
      question: 'What is the dress code?',
      placeholder: 'We are requesting [DRESS CODE — e.g. black tie, cocktail attire, semi-formal, smart casual]. When in doubt, dress up a little!',
    },
    {
      question: 'Is there anything specific I should wear or avoid?',
      placeholder: 'The ceremony will be held [INDOORS/OUTDOORS], so [SUGGESTION — e.g. please keep this in mind if wearing heels]. We kindly ask guests not to wear white.',
    },
    {
      question: 'Will the event be indoors or outdoors?',
      placeholder: 'The ceremony will be [INDOORS/OUTDOORS] and the reception will be [INDOORS/OUTDOORS]. Please dress accordingly for the weather.',
    },
  ],

  food: [
    {
      question: 'Will there be an open bar?',
      placeholder: 'Yes! We will be offering [DESCRIPTION — e.g. a full open bar with cocktails, wine, and beer] throughout the reception.',
    },
    {
      question: 'What food will be served?',
      placeholder: 'We will be serving [CUISINE TYPE] with options for [DIETARY OPTIONS — e.g. meat eaters, vegetarians, and vegans].',
    },
    {
      question: 'What if I have dietary restrictions or allergies?',
      placeholder: 'We want everyone to enjoy the meal! If you have a serious allergy or dietary restriction, please contact us at [CONTACT] so we can make arrangements with our caterer.',
    },
    {
      question: 'Will there be a cocktail hour?',
      placeholder: 'Yes! Immediately following the ceremony we will host a cocktail hour at [LOCATION] with light bites and drinks.',
    },
  ],

  logistics: [
    {
      question: 'Is there parking available?',
      placeholder: 'Yes, free parking is available at [LOCATION]. Please allow extra time to park and walk to the entrance.',
    },
    {
      question: 'Is the venue accessible for guests with mobility needs?',
      placeholder: 'Yes, [VENUE NAME] is fully accessible. If you have specific needs, please contact us at [CONTACT] and we will make sure you are taken care of.',
    },
    {
      question: 'Is there a shuttle or transportation between venues?',
      placeholder: 'We will be providing a shuttle between [LOCATION A] and [LOCATION B]. The shuttle will depart at [TIMES]. Rideshare is also readily available.',
    },
    {
      question: 'What is the nearest airport?',
      placeholder: 'The nearest airport is [AIRPORT NAME AND CODE]. The venue is approximately [DISTANCE/TIME] from the airport.',
    },
  ],

  gifts: [
    {
      question: 'Where are you registered?',
      placeholder: 'We are registered at [STORE/WEBSITE]. A link to our registry can be found on the Registry tab of this website.',
    },
    {
      question: 'Do you accept cash gifts?',
      placeholder: 'Your presence is the greatest gift of all! If you would like to contribute monetarily, we are saving for [PURPOSE — e.g. our honeymoon / new home]. Cash or Venmo to [DETAILS] is welcome.',
    },
    {
      question: 'Should I bring a gift to the wedding?',
      placeholder: 'Please do not feel obligated. If you do bring a gift, a card table will be available near the entrance. We recommend shipping larger gifts directly to our home.',
    },
  ],

  children: [
    {
      question: 'Can I bring my children?',
      placeholder: 'We love your little ones! [CHOOSE ONE: Our wedding is child-friendly and we welcome children of all ages. / Our reception will be an adults-only celebration. The only exceptions are children in the wedding party. We hope this lets everyone relax and enjoy the evening!]',
    },
    {
      question: 'Will there be childcare provided?',
      placeholder: "We will have a supervised kids' area at the reception with activities and snacks. / We have not arranged childcare but can recommend [LOCAL BABYSITTER SERVICE] for the evening.",
    },
  ],

  photos: [
    {
      question: 'Can I take photos during the ceremony?',
      placeholder: 'We are having an [UNPLUGGED/PLUGGED] ceremony. [UNPLUGGED: We kindly ask all guests to put away phones and cameras during the ceremony so everyone can be fully present. Our photographer will capture every moment! PLUGGED: Feel free to take photos — we just ask that you stay in your seat and avoid blocking our photographer\'s shots.]',
    },
    {
      question: 'Can I share photos on social media?',
      placeholder: 'Yes! We love seeing your perspective of the day. Please tag us at [HANDLES] and use our wedding hashtag [#HASHTAG]. We ask that you wait until after the ceremony to post.',
    },
    {
      question: 'When will the professional photos be ready?',
      placeholder: 'Our photographer will deliver the full gallery within [X] weeks. We will share the gallery link via the VowVendors wedding hub as soon as it is ready!',
    },
  ],

  general: [
    {
      question: 'What should I do if I cannot attend?',
      placeholder: 'We will miss you! Please let us know as soon as possible by [METHOD — e.g. using the RSVP form on this page / texting us at (XXX) XXX-XXXX]. We completely understand.',
    },
    {
      question: 'What is the RSVP deadline?',
      placeholder: 'Please RSVP by [DATE]. This helps us finalize seating and catering numbers with our vendors.',
    },
    {
      question: 'Can I bring a plus one?',
      placeholder: 'Your invitation will indicate whether a plus one has been included. If you have questions, please reach out to us directly at [CONTACT].',
    },
    {
      question: 'What is the best way to contact you with questions?',
      placeholder: 'The best way to reach us is by text or email at [CONTACT]. We will do our best to respond within [TIMEFRAME].',
    },
  ],
}

export const FAQ_CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  schedule:  { label: 'Schedule',      emoji: '📅' },
  attire:    { label: 'Attire',        emoji: '👗' },
  food:      { label: 'Food & Drinks', emoji: '🍽️' },
  logistics: { label: 'Logistics',     emoji: '🚗' },
  gifts:     { label: 'Gifts',         emoji: '🎁' },
  children:  { label: 'Children',      emoji: '👶' },
  photos:    { label: 'Photos',        emoji: '📸' },
  general:   { label: 'General',       emoji: '💬' },
}

export const FAQ_CATEGORIES = Object.keys(FAQ_TEMPLATES) as Array<keyof typeof FAQ_TEMPLATES>
