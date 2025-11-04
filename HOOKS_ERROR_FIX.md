# React Hooks Error Fix - "Rendered fewer hooks than expected"

## 1. ERROR TRACE

```
Error: Rendered fewer hooks than expected. This may be caused by an accidental early return statement.

  at OnboardingScreen (mobile/src/screens/OnboardingScreen.tsx:297)
  at renderStep1 (mobile/src/screens/OnboardingScreen.tsx:296)
  
Component: OnboardingScreen
File: mobile/src/screens/OnboardingScreen.tsx
Line: 297 (inside renderStep1 function)
```

## 2. ROOT CAUSE ANALYSIS

**Root Cause:** **A React Hook (`useRef`) was called conditionally inside the `renderStep1()` function, which violates the Rules of Hooks.**

### The Problem:
```typescript
const renderStep1 = () => {
  const continueButtonScale = useRef(new Animated.Value(1)).current; // ❌ Hook called conditionally
  // ...
}
```

This function is only called when `step === 1`:
```typescript
{step === 1 && renderStep1()}
```

**Why This Breaks:**
- React Hooks must be called in the same order on every render
- When `step !== 1`, `renderStep1()` is not called, so `useRef` is not called
- When `step === 1`, `renderStep1()` is called, so `useRef` IS called
- This causes React to see different numbers of hooks on different renders → ERROR

### All Hooks in Component:
1. `useFonts()` - Line 56 ✅ (top level)
2. `useState(1)` - Line 61 ✅ (top level)
3. `useState(false)` - Line 62 ✅ (top level)
4. `useState<FormData>(...)` - Line 63 ✅ (top level)
5. `useRef(...)` - Line 73 ✅ (top level)
6. `useRef(...)` - Line 74 ✅ (top level)
7. `useRef(...)` - Line 297 ❌ **INSIDE CONDITIONAL FUNCTION** (VIOLATION)
8. `useEffect(...)` - Line 82 ✅ (top level)

## 3. FIX PLAN

**File to Edit:** `mobile/src/screens/OnboardingScreen.tsx`

**Changes Required:**
1. Move `continueButtonScale` useRef to component top level (before useEffect)
2. Remove the useRef call from inside `renderStep1()`
3. Keep the ref reference in `renderStep1()` but use the top-level ref

## 4. IMPLEMENTED FIX

### Code Diff:

**Before (Line 296-297):**
```typescript
const renderStep1 = () => {
  const continueButtonScale = useRef(new Animated.Value(1)).current; // ❌ Hook in conditional function
  // ...
}
```

**After:**
```typescript
// At component top level (Line 82-83):
const continueButtonScale = useRef(new Animated.Value(1)).current; // ✅ Hook at top level

// Inside renderStep1 (Line 299-315):
const renderStep1 = () => {
  // Note: continueButtonScale is now defined at component top level
  // to comply with Rules of Hooks (hooks cannot be conditional)
  
  const handleContinuePressIn = () => {
    Animated.spring(continueButtonScale, { // ✅ Uses top-level ref
      // ...
    });
  };
  // ...
}
```

### Key Changes:
- ✅ Moved `continueButtonScale` useRef to top level (line 83)
- ✅ Removed useRef from inside `renderStep1()`
- ✅ Added comment explaining why it's at top level
- ✅ All hooks now called in consistent order on every render

## 5. VERIFICATION

### Test Steps:
1. ✅ Start app: `cd mobile && npx expo start --clear`
2. ✅ Navigate to onboarding screen
3. ✅ Click "Dating" card - No hooks error
4. ✅ Click "Engaged" card - No hooks error
5. ✅ Click "Married" card - No hooks error
6. ✅ Click "Continue" - No hooks error, navigates to step 2
7. ✅ Navigate back and forth between steps - No hooks error

### Expected Behavior:
- ✅ No "Rendered fewer hooks than expected" error
- ✅ All cards work correctly
- ✅ Continue button animates correctly
- ✅ Navigation between steps works smoothly

## 6. RULES OF HOOKS - KEY POINTS

1. **Only call hooks at the top level** - Don't call hooks inside loops, conditions, or nested functions
2. **Call hooks in the same order** - React relies on the order of hook calls
3. **Don't call hooks conditionally** - Every render must call the same hooks in the same order

### What Was Wrong:
```typescript
// ❌ BAD - Hook called conditionally
const renderStep1 = () => {
  const ref = useRef(...); // Only called when step === 1
}

// ✅ GOOD - Hook called at top level
const ref = useRef(...); // Always called
const renderStep1 = () => {
  // Use ref here
}
```

## 7. CONFIRMATION

**Status:** ✅ FIXED

The hooks error has been resolved by moving the `useRef` call from inside the conditional `renderStep1()` function to the component's top level, ensuring all hooks are called in the same order on every render.

**All relationship status cards now work correctly without hooks errors.**

