/**
 * Test pattern matching in ConverterRegistry
 */

const { ConverterRegistry } = require('./elementor-format-converter.js');

console.log('=== Testing Pattern Matching ===\n');

const registry = new ConverterRegistry();

// Test wildcard patterns
console.log('Test 1: Wildcard patterns');
console.log('  Pattern "video*" matches "video_player":', registry.matchesPattern('video_player', ['video*']));
console.log('  Pattern "video*" matches "videoplayer":', registry.matchesPattern('videoplayer', ['video*']));
console.log('  Pattern "video*" matches "wd_video":', registry.matchesPattern('wd_video', ['video*']));
console.log('  Pattern "*_video" matches "wd_video":', registry.matchesPattern('wd_video', ['*_video']));
console.log('  Pattern "*_video" matches "custom_video":', registry.matchesPattern('custom_video', ['*_video']));
console.log('  Pattern "*_video" matches "wd_video_player":', registry.matchesPattern('wd_video_player', ['*_video']));

console.log('\nTest 2: Multiple patterns');
const patterns = ['video*', 'player*', '*_video', '*_player'];
console.log('  Patterns:', patterns);
console.log('  Matches "wd_video_player":', registry.matchesPattern('wd_video_player', patterns));
console.log('  Matches "video_embed":', registry.matchesPattern('video_embed', patterns));
console.log('  Matches "player_widget":', registry.matchesPattern('player_widget', patterns));
console.log('  Matches "custom_video":', registry.matchesPattern('custom_video', patterns));
console.log('  Matches "custom_player":', registry.matchesPattern('custom_player', patterns));

console.log('\nTest 3: Regex patterns');
const regexPattern = /video|player/i;
console.log('  Pattern /video|player/i matches "wd_video_player":', registry.matchesPattern('wd_video_player', [regexPattern]));
console.log('  Pattern /video|player/i matches "custom_video":', registry.matchesPattern('custom_video', [regexPattern]));
console.log('  Pattern /video|player/i matches "image":', registry.matchesPattern('image', [regexPattern]));

console.log('\n=== Pattern Matching Tests Complete ===');
