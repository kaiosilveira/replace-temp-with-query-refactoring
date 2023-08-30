[![Continuous Integration](https://github.com/kaiosilveira/replace-temp-with-query-refactoring/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/replace-temp-with-query-refactoring/actions/workflows/ci.yml)

ℹ️ _This repository is part of my Refactoring catalog based on Fowler's book with the same title. Please see [kaiosilveira/refactoring](https://github.com/kaiosilveira/refactoring) for more details._

---

# Replace Temp With Query

<table>
<thead>
<th>Before</th>
<th>After</th>
</thead>
<tbody>
<tr>
<td>

```javascript
const basePrice = this._quantity * this._itemPrice;
if (basePrice > 1000) return basePrice * 0.95;
else return basePrice * 0.98;
```

</td>

<td>

```javascript
class Order {
  get basePrice() {
    this._quantity * this._itemPrice;
  }
  // ...
}

// ...

if (basePrice > 1000) return basePrice * 0.95;
else return basePrice * 0.98;
```

</td>
</tr>
</tbody>
</table>

Sometimes we find it useful to use temporary variables, they help us capture the meaning of involved expressions and also help us to refer to a chunk of computation later. In some situations, though, they're not enough. Sometimes we want to compute a value based on a specific context, so creating multiple temp variables would be less than ideal. In these cases, it's often better to replace the temp with a query.

## Working example

Our working example consists of an `Order` class, which contains a `price` getter that contains a basic computation for the total price of the order.

```javascript
export class Order {
  constructor(quantity, item) {
    this._quantity = quantity;
    this._item = item;
  }

  get price() {
    var basePrice = this._quantity * this._item.price;
    var discountFactor = 0.98;

    if (basePrice > 1000) discountFactor -= 0.03;

    return basePrice * discountFactor;
  }
}
```

After some small steps, we end up with a clearer and more expressive `price` getter, alongside two new getters: `basePrice` and `discountFactor`, each of them with their own segregated responsibilities and limited scope. Code like this makes the life of readers easier but also provides valuable entry points for new behavior. Check below the step-by-step description that led to these results.

### Test suite

A simple test suite was put in place to support our refactorings. It performs assertions on the `price` value of an order to make sure that the discounts are being applied correctly.

```javascript
describe('Order', () => {
  describe('price', () => {
    it('should apply a standard discount of 2% for orders with item quantities below 1000', () => {
      const item = { price: 100 };
      const order = new Order(10, item);
      expect(order.price).toBe(980);
    });

    it('should apply an additional discount of 3% for orders with item quantities above 1000', () => {
      const item = { price: 100 };
      const order = new Order(11, item);
      expect(order.price).toBe(1045);
    });
  });
});
```

### Steps

We start by making `basePrice` a `const`. It helps prevent unexpected reassignments:

```diff

diff --git a/src/index.js b/src/index.js
@@ -5,7 +5,7 @@export class Order {
   }

   get price() {
-    var basePrice = this._quantity * this._item.price;
+    const basePrice = this._quantity * this._item.price;
     var discountFactor = 0.98;

     if (basePrice > 1000) discountFactor -= 0.03;
```

Then, we move on to extract a `basePrice` getter:

```diff
diff --git a/src/index.js b/src/index.js
@@ -5,11 +5,15 @@ export class Order {
   }

   get price() {
-    const basePrice = this._quantity * this._item.price;
+    const basePrice = this.basePrice;
     var discountFactor = 0.98;

     if (basePrice > 1000) discountFactor -= 0.03;

     return basePrice * discountFactor;
   }
+
+  get basePrice() {
+    return this._quantity * this._item.price;
+  }
 }
```

And now that we have a proper getter, we can inline `basePrice` and get rid of its temp variable:

```diff
diff --git a/src/index.js b/src/index.js
@@ -5,12 +5,11 @@ export class Order {
   }

   get price() {
-    const basePrice = this.basePrice;
     var discountFactor = 0.98;

-    if (basePrice > 1000) discountFactor -= 0.03;
+    if (this.basePrice > 1000) discountFactor -= 0.03;

-    return basePrice * discountFactor;
+    return this.basePrice * discountFactor;
   }

   get basePrice() {
```

We then repeat the steps for `discountFactor`. First, extracting the getter:

```diff
diff --git a/src/index.js b/src/index.js
@@ -5,14 +5,17 @@ export class Order {
   }

   get price() {
-    var discountFactor = 0.98;
-
-    if (this.basePrice > 1000) discountFactor -= 0.03;
-
+    var discountFactor = this.discountFactor;
     return this.basePrice * discountFactor;
   }

   get basePrice() {
     return this._quantity * this._item.price;
   }
+
+  get discountFactor() {
+    let discountFactor = 0.98;
+    if (this.basePrice > 1000) discountFactor -= 0.03;
+    return discountFactor;
+  }
 }
```

And then inlining the variable:

```diff
diff --git a/src/index.js b/src/index.js
@@ -5,8 +5,7 @@ export class Order {
   }

   get price() {
-    var discountFactor = this.discountFactor;
-    return this.basePrice * discountFactor;
+    return this.basePrice * this.discountFactor;
   }

   get basePrice() {

```

And that's it!

### Commit history

Below there's the commit history for the steps detailed above.

| Commit SHA                                                                                           | Message                        |
| ---------------------------------------------------------------------------------------------------- | ------------------------------ |
| [8e0dae6](https://github.com/kaiosilveira/undefined/commit/8e0dae658854d0c1ca323c5a1827dca9c401f55e) | make basePrice constant        |
| [767f4e4](https://github.com/kaiosilveira/undefined/commit/767f4e4f4349a77f386de1b33f58d362bb353034) | extract basePrice getter       |
| [2ba76a8](https://github.com/kaiosilveira/undefined/commit/2ba76a89ce13203c2bfdf7bbee585e9bdcad52aa) | inline basePrice variable      |
| [d1deb86](https://github.com/kaiosilveira/undefined/commit/d1deb868fc41678543b9668b4f592244cd32c87f) | extract discountFactor getter  |
| [8205bcf](https://github.com/kaiosilveira/undefined/commit/8205bcf49527c4832980fd74a609053a7608f81c) | inline discountFactor variable |

For the full commit history for this project, check the [Commit History tab](https://github.com/kaiosilveira/replace-temp-with-query-refactoring/commits/main).
