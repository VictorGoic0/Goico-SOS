# Design System Documentation

This document provides usage patterns for all design system components in the project.

## Component Library

### Button Component

**Location:** `src/components/Button.js`

**Usage Pattern:**

```jsx
import Button from "../components/Button";

<Button
  variant="primary" // Options: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size="md" // Options: "sm" | "md" | "lg"
  loading={false} // Shows ActivityIndicator instead of text
  disabled={false} // Disables button and reduces opacity
  fullWidth={false} // Makes button width 100%
  onPress={handlePress}
  style={{}} // Optional custom styles
  textStyle={{}} // Optional text styles
>
  Button Text Here {/* IMPORTANT: Use children, NOT title prop */}
</Button>;
```

**Common Mistakes:**

- ❌ `<Button title="Click Me" />` - Button uses `children`, not `title`
- ✅ `<Button>Click Me</Button>` - Correct usage

**Examples:**

```jsx
// Primary button
<Button onPress={handleSave}>Save Changes</Button>

// Danger button with full width
<Button variant="danger" fullWidth onPress={handleDelete}>
  Delete Account
</Button>

// Loading state
<Button loading disabled>
  Processing...
</Button>

// Outline button
<Button variant="outline" onPress={handleCancel}>
  Cancel
</Button>
```

---

### Input Component

**Location:** `src/components/Input.js`

**Usage Pattern:**

```jsx
import Input from "../components/Input";

<Input
  label="Email" // Optional label above input
  placeholder="Enter email" // Placeholder text
  value={email} // Controlled value
  onChangeText={setEmail} // Change handler
  error={emailError} // Error message to display
  secureTextEntry={false} // For password fields
  keyboardType="default" // Options: "default" | "email-address" | "numeric" | etc.
  autoCapitalize="none" // Options: "none" | "sentences" | "words" | "characters"
  autoComplete="email" // For autofill suggestions
  editable={true} // Enable/disable editing
  maxLength={50} // Character limit
  multiline={false} // For textarea-like input
  numberOfLines={1} // For multiline inputs
  style={{}} // Optional custom styles
/>;
```

**Examples:**

```jsx
// Email input with validation
<Input
  label="Email Address"
  placeholder="you@example.com"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  keyboardType="email-address"
  autoCapitalize="none"
  autoComplete="email"
/>

// Password input
<Input
  label="Password"
  placeholder="Enter password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry={true}
  autoComplete="password"
/>

// Multiline textarea
<Input
  label="Bio"
  placeholder="Tell us about yourself"
  value={bio}
  onChangeText={setBio}
  multiline
  numberOfLines={4}
  maxLength={200}
/>
```

---

### CompactInput Component

**Location:** `src/components/CompactInput.js`

**Usage Pattern:**

```jsx
import CompactInput from "../components/CompactInput";

<CompactInput
  value={message}
  onChangeText={setMessage}
  onSubmit={handleSend} // Called when send button pressed
  placeholder="Type a message..."
  style={{}} // Optional custom styles
/>;
```

**Use Case:** Chat message input with integrated send button

**Example:**

```jsx
<CompactInput
  value={inputText}
  onChangeText={handleInputChange}
  onSubmit={handleSend}
  placeholder="Type a message..."
/>
```

---

### Card Component

**Location:** `src/components/Card.js`

**Usage Pattern:**

```jsx
import Card from "../components/Card";

<Card
  variant="default" // Options: "default" | "outlined" | "elevated"
  padding="default" // Options: "none" | "sm" | "default" | "lg"
  style={{}} // Optional custom styles
>
  {/* Card content here */}
</Card>;
```

**Examples:**

```jsx
// Default card
<Card>
  <Text>Card content</Text>
</Card>

// Outlined card with large padding
<Card variant="outlined" padding="lg">
  <Text>Important information</Text>
</Card>

// Elevated card (with shadow)
<Card variant="elevated">
  <Text>Floating card</Text>
</Card>
```

---

### MessageBubble Component

**Location:** `src/components/MessageBubble.js`

**Usage Pattern:**

```jsx
import MessageBubble from "../components/MessageBubble";

<MessageBubble
  message={{
    messageId: "123",
    text: "Hello!",
    timestamp: Date.now(),
    status: "sent", // Options: "sending" | "sent" | "delivered" | "read"
    senderId: "user123",
    senderUsername: "john_doe",
    imageURL: null,
    metadata: { hasPendingWrites: false },
  }}
  isSent={true} // true = sent by current user (blue), false = received (gray)
/>;
```

**Example:**

```jsx
<FlatList
  data={messages}
  renderItem={({ item }) => (
    <MessageBubble message={item} isSent={item.senderId === currentUser.uid} />
  )}
/>
```

---

### UserListItem Component

**Location:** `src/components/UserListItem.js`

**Usage Pattern:**

```jsx
import UserListItem from "../components/UserListItem";

<UserListItem
  user={{
    userId: "123",
    username: "john_doe",
    displayName: "John Doe",
    imageURL: "https://...",
    status: "Available",
  }}
  onPress={() => handleUserPress(user)}
  onLongPress={() => handleUserLongPress(user)} // Optional
  isCurrentUser={false} // Dims and disables if true
  isDeleting={false} // Shows loading indicator
/>;
```

**Example:**

```jsx
<FlatList
  data={users}
  renderItem={({ item }) => (
    <UserListItem
      user={item}
      onPress={() => navigation.navigate("Chat", { otherUser: item })}
      onLongPress={() => handleDeleteConversation(item)}
      isCurrentUser={item.userId === currentUser.uid}
    />
  )}
/>
```

---

## Design Tokens

**Location:** `src/styles/tokens.js`

### Colors

```javascript
import { colors } from "../styles/tokens";

// Primary colors
colors.primary.base
colors.primary.lighter
colors.primary.light
colors.primary.mediumDark
colors.primary.dark
colors.primary.darker

// Secondary colors
colors.secondary.*

// Neutral colors
colors.neutral.white
colors.neutral.lighter
colors.neutral.light
colors.neutral.mediumLight
colors.neutral.medium
colors.neutral.mediumDark
colors.neutral.dark
colors.neutral.darker
colors.neutral.black

// Semantic colors
colors.success.main
colors.error.main
colors.warning.main
colors.info.main

// Text colors
colors.text.primary
colors.text.secondary
colors.text.tertiary

// Background colors
colors.background.default
colors.background.paper

// Border colors
colors.border.light
colors.border.medium
```

### Typography

```javascript
import { typography } from "../styles/tokens";

// Font sizes
typography.fontSize.xs; // 12px
typography.fontSize.sm; // 14px
typography.fontSize.base; // 16px
typography.fontSize.lg; // 18px
typography.fontSize.xl; // 20px
typography.fontSize["2xl"]; // 24px
typography.fontSize["3xl"]; // 30px
typography.fontSize["4xl"]; // 36px

// Font weights
typography.fontWeight.regular; // "400"
typography.fontWeight.medium; // "500"
typography.fontWeight.semibold; // "600"
typography.fontWeight.bold; // "700"
```

### Spacing

```javascript
import { spacing } from "../styles/tokens";

spacing[0]; // 0px
spacing[1]; // 4px
spacing[2]; // 8px
spacing[3]; // 12px
spacing[4]; // 16px
spacing[5]; // 20px
spacing[6]; // 24px
spacing[8]; // 32px
spacing[10]; // 40px
spacing[12]; // 48px
spacing[16]; // 64px
```

### Border Radius

```javascript
import { borderRadius } from "../styles/tokens";

borderRadius.sm; // 4px
borderRadius.base; // 8px
borderRadius.md; // 12px
borderRadius.lg; // 16px
borderRadius.xl; // 24px
borderRadius.full; // 9999px (circular)
```

### Shadows

```javascript
import { shadows } from "../styles/tokens";

// Apply shadows in StyleSheet
const styles = StyleSheet.create({
  card: {
    ...shadows.sm, // Small shadow
    ...shadows.md, // Medium shadow
    ...shadows.lg, // Large shadow
  },
});
```

---

## Common Patterns

### Form Layout

```jsx
<View style={styles.form}>
  <Input
    label="Email"
    value={email}
    onChangeText={setEmail}
    error={emailError}
    keyboardType="email-address"
  />
  <Input
    label="Password"
    value={password}
    onChangeText={setPassword}
    secureTextEntry
  />
  <Button fullWidth onPress={handleSubmit}>
    Sign In
  </Button>
</View>
```

### List with Items

```jsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <Card>
      <Text>{item.title}</Text>
    </Card>
  )}
  contentContainerStyle={styles.listContainer}
/>
```

### Loading State

```jsx
{
  isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary.base} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  ) : (
    <View>{/* Content */}</View>
  );
}
```

### Empty State

```jsx
<View style={styles.emptyContainer}>
  <Text style={styles.emptyText}>No items found</Text>
  <Text style={styles.emptySubtext}>Try adding your first item</Text>
  <Button onPress={handleAdd}>Add Item</Button>
</View>
```

---

## Best Practices

1. **Always use design tokens** - Never hardcode colors, spacing, or typography
2. **Use children for component content** - Most components accept `children`, not `title` or similar props
3. **Follow naming conventions** - Use descriptive prop names like `onPress`, `onChangeText`
4. **Provide accessibility** - Add `accessibilityLabel` and `accessibilityHint` where appropriate
5. **Handle loading/error states** - Always show feedback for async operations
6. **Use StyleSheet.create()** - Create styles outside component for better performance
7. **Spread style props last** - Allow custom styles to override default styles: `[styles.base, style]`
