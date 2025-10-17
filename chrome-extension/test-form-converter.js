/**
 * Test script for FormConverter
 * Verifies form widget conversion functionality
 */

// Load the format converter module
const {
  converterRegistry,
  conversionLogger,
  generateElementId
} = require('./elementor-format-converter.js');

console.log('=== Testing FormConverter ===\n');

// Helper to create context
function createTestContext() {
  return {
    generateElementId: generateElementId,
    logger: conversionLogger,
    extractImageUrl: () => null,
    extractTextContent: () => null,
    extractHeadingData: () => ({ title: '', tag: 'h2', align: '' }),
    extractButtonData: () => ({ text: '', link: null, align: 'center' }),
    extractIconData: () => ({ icon: null })
  };
}

// Test 1: Convert form from settings with fields array
console.log('Test 1: Convert form from settings with fields array');
try {
  const element = {
    widgetType: 'contact-form',
    settings: {
      fields: [
        {
          type: 'text',
          label: 'Name',
          placeholder: 'Enter your name',
          required: true,
          name: 'name'
        },
        {
          type: 'email',
          label: 'Email',
          placeholder: 'Enter your email',
          required: true,
          name: 'email'
        },
        {
          type: 'textarea',
          label: 'Message',
          placeholder: 'Your message',
          required: false,
          name: 'message'
        }
      ],
      email_to: 'admin@example.com',
      submit_button_text: 'Send Message'
    },
    renderedContent: '',
    isInner: false
  };

  const converter = converterRegistry.getConverter('contact-form');
  if (!converter) {
    console.log('✗ FormConverter not found in registry');
  } else {
    console.log('✓ FormConverter found in registry');
    
    const canConvert = converter.canConvert(element, 'contact-form');
    console.log('✓ canConvert returns:', canConvert);
    
    if (canConvert) {
      const context = createTestContext();
      const result = converter.convert(element, 'contact-form', context);
      
      if (result) {
        console.log('✓ Conversion successful');
        console.log('  - Widget type:', result.widgetType);
        console.log('  - Field count:', result.settings.form_fields?.length || 0);
        console.log('  - Submit button text:', result.settings.submit_button_text);
        console.log('  - Email recipient:', result.settings.email_to);
        console.log('  - Conversion metadata:', result._conversionMeta);
        console.log('  - Warnings:', result._conversionMeta?.warnings);
      } else {
        console.log('✗ Conversion returned null');
      }
    }
  }
} catch (e) {
  console.log('✗ Test 1 failed:', e.message);
  console.error(e.stack);
}

// Test 2: Convert form from HTML
console.log('\nTest 2: Convert form from HTML');
try {
  const element = {
    widgetType: 'custom_form',
    settings: {},
    renderedContent: `
      <form action="/submit" method="post">
        <input type="text" name="name" placeholder="Your Name" required />
        <input type="email" name="email" placeholder="Your Email" required />
        <textarea name="message" placeholder="Your Message"></textarea>
        <select name="subject" required>
          <option value="">Select Subject</option>
          <option value="general">General Inquiry</option>
          <option value="support">Support</option>
        </select>
        <input type="submit" value="Submit Form" />
      </form>
    `,
    isInner: false
  };

  const converter = converterRegistry.getConverter('custom_form');
  if (converter && converter.canConvert(element, 'custom_form')) {
    const context = createTestContext();
    const result = converter.convert(element, 'custom_form', context);
    
    if (result) {
      console.log('✓ HTML form conversion successful');
      console.log('  - Widget type:', result.widgetType);
      console.log('  - Field count:', result.settings.form_fields?.length || 0);
      console.log('  - Fields extracted:');
      result.settings.form_fields?.forEach((field, i) => {
        console.log(`    ${i + 1}. ${field.field_label} (${field.field_type}) - Required: ${field.required}`);
      });
      console.log('  - Submit button text:', result.settings.submit_button_text);
    } else {
      console.log('✗ HTML form conversion returned null');
    }
  } else {
    console.log('✗ FormConverter cannot handle custom_form');
  }
} catch (e) {
  console.log('✗ Test 2 failed:', e.message);
  console.error(e.stack);
}

// Test 3: Convert Contact Form 7 style
console.log('\nTest 3: Convert Contact Form 7 style');
try {
  const element = {
    widgetType: 'cf7_form',
    settings: {
      form_fields: [
        {
          field_type: 'text_field',
          field_label: 'Full Name',
          is_required: true,
          field_name: 'full_name'
        },
        {
          field_type: 'email_field',
          field_label: 'Email Address',
          is_required: true,
          field_name: 'email_address'
        },
        {
          field_type: 'select_field',
          field_label: 'Department',
          options: ['Sales', 'Support', 'Billing'],
          field_name: 'department'
        }
      ],
      recipient_email: 'contact@example.com',
      button_text: 'Send'
    },
    renderedContent: '',
    isInner: false
  };

  const converter = converterRegistry.getConverter('cf7_form');
  if (converter && converter.canConvert(element, 'cf7_form')) {
    const context = createTestContext();
    const result = converter.convert(element, 'cf7_form', context);
    
    if (result) {
      console.log('✓ CF7 form conversion successful');
      console.log('  - Widget type:', result.widgetType);
      console.log('  - Field count:', result.settings.form_fields?.length || 0);
      console.log('  - Email recipient:', result.settings.email_to);
      console.log('  - Data loss:', result._conversionMeta?.dataLoss);
    } else {
      console.log('✗ CF7 form conversion returned null');
    }
  } else {
    console.log('✗ FormConverter cannot handle cf7_form');
  }
} catch (e) {
  console.log('✗ Test 3 failed:', e.message);
  console.error(e.stack);
}

// Test 4: Field type mapping
console.log('\nTest 4: Field type mapping');
try {
  const element = {
    widgetType: 'wpforms',
    settings: {
      inputs: [
        { inputType: 'textfield', label: 'Text Field' },
        { inputType: 'email', label: 'Email Field' },
        { inputType: 'phone', label: 'Phone Field' },
        { inputType: 'dropdown', label: 'Dropdown', choices: [
          { text: 'Option 1', value: 'opt1' },
          { text: 'Option 2', value: 'opt2' }
        ]},
        { inputType: 'radio_buttons', label: 'Radio Buttons', choices: [
          { text: 'Yes', value: 'yes' },
          { text: 'No', value: 'no' }
        ]},
        { inputType: 'file_upload', label: 'Upload File' }
      ]
    },
    renderedContent: '',
    isInner: false
  };

  const converter = converterRegistry.getConverter('wpforms');
  if (converter && converter.canConvert(element, 'wpforms')) {
    const context = createTestContext();
    const result = converter.convert(element, 'wpforms', context);
    
    if (result) {
      console.log('✓ Field type mapping successful');
      console.log('  - Fields mapped:');
      result.settings.form_fields?.forEach((field, i) => {
        console.log(`    ${i + 1}. ${field.field_label}: ${field.field_type}`);
      });
    } else {
      console.log('✗ Field type mapping conversion returned null');
    }
  } else {
    console.log('✗ FormConverter cannot handle wpforms');
  }
} catch (e) {
  console.log('✗ Test 4 failed:', e.message);
  console.error(e.stack);
}

// Test 5: Pattern matching for various form widget types
console.log('\nTest 5: Pattern matching for various form widget types');
const formWidgetTypes = [
  'contact-form',
  'contact_form',
  'form',
  'cf7',
  'gravity-form',
  'wpforms',
  'ninja-form',
  'custom_contact_form',
  'theme_form_widget'
];

formWidgetTypes.forEach(widgetType => {
  const converter = converterRegistry.getConverter(widgetType);
  const hasConverter = converter !== null;
  console.log(`  - ${widgetType}: ${hasConverter ? '✓ matched' : '✗ not matched'}`);
});

console.log('\n=== FormConverter Tests Complete ===');
