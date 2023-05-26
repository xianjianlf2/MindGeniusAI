'

# Props [​](#props)

Ad[Build and deploy your own ChatGPT bot with JavaScript in 5 minutes](https://aircode.io)

> This page assumes you\\'ve already read the [Components Basics](/guide/essentials/component-basics.html). Read that first if you are new to components.

[Watch a free video lesson on Vue School](https://vueschool.io/lessons/vue-3-reusable-components-with-props?friend=vuejs 'Free Vue.js Props Lesson')

## Props Declaration [​](#props-declaration)

Vue components require explicit props declaration so that Vue knows what external props passed to the component should be treated as fallthrough attributes (which will be discussed in [its dedicated section](/guide/components/attrs.html)).

In SFCs using `<script setup>`, props can be declared using the `defineProps()` macro:

vue

    <script setup>\nconst props = defineProps([\'foo\'])\n\nconsole.log(props.foo)\n</script>

In non-`<script setup>` components, props are declared using the [`props`](/api/options-state.html#props) option:

js

    export default {\n  props: [\'foo\'],\n  setup(props) {\n    // setup() receives props as the first argument.\n    console.log(props.foo)\n  }\n}

Notice the argument passed to `defineProps()` is the same as the value provided to the `props` options: the same props options API is shared between the two declaration styles.

Props are declared using the [`props`](/api/options-state.html#props) option:

js

    export default {\n  props: [\'foo\'],\n  created() {\n    // props are exposed on `this`\n    console.log(this.foo)\n  }\n}

In addition to declaring props using an array of strings, we can also use the object syntax:

js

    export default {\n  props: {\n    title: String,\n    likes: Number\n  }\n}

js

    // in <script setup>\ndefineProps({\n  title: String,\n  likes: Number\n})

js

    // in non-<script setup>\nexport default {\n  props: {\n    title: String,\n    likes: Number\n  }\n}

For each property in the object declaration syntax, the key is the name of the prop, while the value should be the constructor function of the expected type.

This not only documents your component, but will also warn other developers using your component in the browser console if they pass the wrong type. We will discuss more details about [prop validation](#prop-validation) further down this page.

See also: [Typing Component Props](/guide/typescript/options-api.html#typing-component-props)

If you are using TypeScript with `<script setup>`, it\\'s also possible to declare props using pure type annotations:

vue

    <script setup lang="ts">\ndefineProps<{\n  title?: string\n  likes?: number\n}>()\n</script>

More details: [Typing Component Props](/guide/typescript/composition-api.html#typing-component-props)

## Prop Passing Details [​](#prop-passing-details)

### Prop Name Casing [​](#prop-name-casing)

We declare long prop names using camelCase because this avoids having to use quotes when using them as property keys, and allows us to reference them directly in template expressions because they are valid JavaScript identifiers:

js

    defineProps({\n  greetingMessage: String\n})

js

    export default {\n  props: {\n    greetingMessage: String\n  }\n}

template

    <span>{{ greetingMessage }}</span>

Technically, you can also use camelCase when passing props to a child component (except in [DOM templates](/guide/essentials/component-basics.html#dom-template-parsing-caveats)). However, the convention is using kebab-case in all cases to align with HTML attributes:

template

    <MyComponent greeting-message="hello" />

We use [PascalCase for component tags](/guide/components/registration.html#component-name-casing) when possible because it improves template readability by differentiating Vue components from native elements. However, there isn\\'t as much practical benefit in using camelCase when passing props, so we choose to follow each language\\'s conventions.

### Static vs. Dynamic Props [​](#static-vs-dynamic-props)

So far, you\\'ve seen props passed as static values, like in:

template

    <BlogPost title="My journey with Vue" />

You\\'ve also seen props assigned dynamically with `v-bind` or its `:` shortcut, such as in:

template

    <!-- Dynamically assign the value of a variable -->\n<BlogPost :title="post.title" />\n\n<!-- Dynamically assign the value of a complex expression -->\n<BlogPost :title="post.title + \' by \' + post.author.name" />

### Passing Different Value Types [​](#passing-different-value-types)

In the two examples above, we happen to pass string values, but _any_ type of value can be passed to a prop.

#### Number [​](#number)

template

    <!-- Even though `42` is static, we need v-bind to tell Vue that -->\n<!-- this is a JavaScript expression rather than a string.       -->\n<BlogPost :likes="42" />\n\n<!-- Dynamically assign to the value of a variable. -->\n<BlogPost :likes="post.likes" />

#### Boolean [​](#boolean)

template

    <!-- Including the prop with no value will imply `true`. -->\n<BlogPost is-published />\n\n<!-- Even though `false` is static, we need v-bind to tell Vue that -->\n<!-- this is a JavaScript expression rather than a string.          -->\n<BlogPost :is-published="false" />\n\n<!-- Dynamically assign to the value of a variable. -->\n<BlogPost :is-published="post.isPublished" />

#### Array [​](#array)

template

    <!-- Even though the array is static, we need v-bind to tell Vue that -->\n<!-- this is a JavaScript expression rather than a string.            -->\n<BlogPost :comment-ids="[234, 266, 273]" />\n\n<!-- Dynamically assign to the value of a variable. -->\n<BlogPost :comment-ids="post.commentIds" />

#### Object [​](#object)

template

    <!-- Even though the object is static, we need v-bind to tell Vue that -->\n<!-- this is a JavaScript expression rather than a string.             -->\n<BlogPost\n  :author="{\n    name: \'Veronica\',\n    company: \'Veridian Dynamics\'\n  }"\n />\n\n<!-- Dynamically assign to the value of a variable. -->\n<BlogPost :author="post.author" />

### Binding Multiple Properties Using an Object [​](#binding-multiple-properties-using-an-object)

If you want to pass all the properties of an object as props, you can use [`v-bind` without an argument](/guide/essentials/template-syntax.html#dynamically-binding-multiple-attributes) (`v-bind` instead of `:prop-name`). For example, given a `post` object:

js

    export default {\n  data() {\n    return {\n      post: {\n        id: 1,\n        title: \'My Journey with Vue\'\n      }\n    }\n  }\n}

js

    const post = {\n  id: 1,\n  title: \'My Journey with Vue\'\n}

The following template:

template

    <BlogPost v-bind="post" />

Will be equivalent to:

template

    <BlogPost :id="post.id" :title="post.title" />

## One-Way Data Flow [​](#one-way-data-flow)

All props form a **one-way-down binding** between the child property and the parent one: when the parent property updates, it will flow down to the child, but not the other way around. This prevents child components from accidentally mutating the parent\\'s state, which can make your app\\'s data flow harder to understand.

In addition, every time the parent component is updated, all props in the child component will be refreshed with the latest value. This means you should **not** attempt to mutate a prop inside a child component. If you do, Vue will warn you in the console:

js

    const props = defineProps([\'foo\'])\n\n// ❌ warning, props are readonly!\nprops.foo = \'bar\'

js

    export default {\n  props: [\'foo\'],\n  created() {\n    // ❌ warning, props are readonly!\n    this.foo = \'bar\'\n  }\n}

There are usually two cases where it\\'s tempting to mutate a prop:

1.  **The prop is used to pass in an initial value; the child component wants to use it as a local data property afterwards.** In this case, it\\'s best to define a local data property that uses the prop as its initial value:

    js

        const props = defineProps([\'initialCounter\'])\n\n// counter only uses props.initialCounter as the initial value;\n// it is disconnected from future prop updates.\nconst counter = ref(props.initialCounter)

    js

        export default {\n  props: [\'initialCounter\'],\n  data() {\n    return {\n      // counter only uses this.initialCounter as the initial value;\n      // it is disconnected from future prop updates.\n      counter: this.initialCounter\n    }\n  }\n}

2.  **The prop is passed in as a raw value that needs to be transformed.** In this case, it\\'s best to define a computed property using the prop\\'s value:

    js

        const props = defineProps([\'size\'])\n\n// computed property that auto-updates when the prop changes\nconst normalizedSize = computed(() => props.size.trim().toLowerCase())

    js

        export default {\n  props: [\'size\'],\n  computed: {\n    // computed property that auto-updates when the prop changes\n    normalizedSize() {\n      return this.size.trim().toLowerCase()\n    }\n  }\n}

### Mutating Object / Array Props [​](#mutating-object-array-props)

When objects and arrays are passed as props, while the child component cannot mutate the prop binding, it **will** be able to mutate the object or array\\'s nested properties. This is because in JavaScript objects and arrays are passed by reference, and it is unreasonably expensive for Vue to prevent such mutations.

The main drawback of such mutations is that it allows the child component to affect parent state in a way that isn\\'t obvious to the parent component, potentially making it more difficult to reason about the data flow in the future. As a best practice, you should avoid such mutations unless the parent and child are tightly coupled by design. In most cases, the child should [emit an event](/guide/components/events.html) to let the parent perform the mutation.

## Prop Validation [​](#prop-validation)

Components can specify requirements for their props, such as the types you\\'ve already seen. If a requirement is not met, Vue will warn you in the browser\\'s JavaScript console. This is especially useful when developing a component that is intended to be used by others.

To specify prop validations, you can provide an object with validation requirements to the `defineProps()` macro`props` option, instead of an array of strings. For example:

js

    defineProps({\n  // Basic type check\n  //  (`null` and `undefined` values will allow any type)\n  propA: Number,\n  // Multiple possible types\n  propB: [String, Number],\n  // Required string\n  propC: {\n    type: String,\n    required: true\n  },\n  // Number with a default value\n  propD: {\n    type: Number,\n    default: 100\n  },\n  // Object with a default value\n  propE: {\n    type: Object,\n    // Object or array defaults must be returned from\n    // a factory function. The function receives the raw\n    // props received by the component as the argument.\n    default(rawProps) {\n      return { message: \'hello\' }\n    }\n  },\n  // Custom validator function\n  propF: {\n    validator(value) {\n      // The value must match one of these strings\n      return [\'success\', \'warning\', \'danger\'].includes(value)\n    }\n  },\n  // Function with a default value\n  propG: {\n    type: Function,\n    // Unlike object or array default, this is not a factory \n    // function - this is a function to serve as a default value\n    default() {\n      return \'Default function\'\n    }\n  }\n})

TIP

Code inside the `defineProps()` argument **cannot access other variables declared in `<script setup>`**, because the entire expression is moved to an outer function scope when compiled.

js

    export default {\n  props: {\n    // Basic type check\n    //  (`null` and `undefined` values will allow any type)\n    propA: Number,\n    // Multiple possible types\n    propB: [String, Number],\n    // Required string\n    propC: {\n      type: String,\n      required: true\n    },\n    // Number with a default value\n    propD: {\n      type: Number,\n      default: 100\n    },\n    // Object with a default value\n    propE: {\n      type: Object,\n      // Object or array defaults must be returned from\n      // a factory function. The function receives the raw\n      // props received by the component as the argument.\n      default(rawProps) {\n        return { message: \'hello\' }\n      }\n    },\n    // Custom validator function\n    propF: {\n      validator(value) {\n        // The value must match one of these strings\n        return [\'success\', \'warning\', \'danger\'].includes(value)\n      }\n    },\n    // Function with a default value\n    propG: {\n      type: Function,\n      // Unlike object or array default, this is not a factory \n      // function - this is a function to serve as a default value\n      default() {\n        return \'Default function\'\n      }\n    }\n  }\n}

Additional details:

- All props are optional by default, unless `required: true` is specified.
- An absent optional prop other than `Boolean` will have `undefined` value.
- The `Boolean` absent props will be cast to `false`. You can change this by setting a `default` for it — i.e.: `default: undefined` to behave as a non-Boolean prop.
- If a `default` value is specified, it will be used if the resolved prop value is `undefined` - this includes both when the prop is absent, or an explicit `undefined` value is passed.

When prop validation fails, Vue will produce a console warning (if using the development build).

If using [Type-based props declarations](/api/sfc-script-setup.html#typescript-only-features) , Vue will try its best to compile the type annotations into equivalent runtime prop declarations. For example, `defineProps<{ msg: string }>` will be compiled into `{ msg: { type: String, required: true }}`.

Note

Note that props are validated **before** a component instance is created, so instance properties (e.g. `data`, `computed`, etc.) will not be available inside `default` or `validator` functions.

### Runtime Type Checks [​](#runtime-type-checks)

The `type` can be one of the following native constructors:

- `String`
- `Number`
- `Boolean`
- `Array`
- `Object`
- `Date`
- `Function`
- `Symbol`

In addition, `type` can also be a custom class or constructor function and the assertion will be made with an `instanceof` check. For example, given the following class:

js

    class Person {\n  constructor(firstName, lastName) {\n    this.firstName = firstName\n    this.lastName = lastName\n  }\n}

You could use it as a prop\\'s type:

js

    defineProps({\n  author: Person\n})

js

    export default {\n  props: {\n    author: Person\n  }\n}

Vue will use `instanceof Person` to validate whether the value of the `author` prop is indeed an instance of the `Person` class.

## Boolean Casting [​](#boolean-casting)

Props with `Boolean` type have special casting rules to mimic the behavior of native boolean attributes. Given a `<MyComponent>` with the following declaration:

js

    defineProps({\n  disabled: Boolean\n})

js

    export default {\n  props: {\n    disabled: Boolean\n  }\n}

The component can be used like this:

template

    <!-- equivalent of passing :disabled="true" -->\n<MyComponent disabled />\n\n<!-- equivalent of passing :disabled="false" -->\n<MyComponent />

When a prop is declared to allow multiple types, e.g.

js

    defineProps({\n  disabled: [Boolean, Number]\n})

js

    export default {\n  props: {\n    disabled: [Boolean, Number]\n  }\n}

The casting rules for `Boolean` will apply regardless of type appearance order.

'
