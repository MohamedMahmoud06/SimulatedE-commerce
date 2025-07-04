var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Product = /** @class */ (function () {
    function Product(name, price, quantity) {
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }
    Product.prototype.isAvailable = function (orderedQuantity) {
        return this.quantity >= orderedQuantity;
    };
    Product.prototype.reduceQuantity = function (orderedQuantity) {
        this.quantity -= orderedQuantity;
    };
    return Product;
}());
var ExpirableProduct = /** @class */ (function (_super) {
    __extends(ExpirableProduct, _super);
    function ExpirableProduct(name, price, quantity, expiryDate) {
        var _this = _super.call(this, name, price, quantity) || this;
        _this.expiryDate = new Date(expiryDate);
        return _this;
    }
    ExpirableProduct.prototype.isExpired = function () {
        return new Date() > this.expiryDate;
    };
    return ExpirableProduct;
}(Product));
var ShippableProduct = /** @class */ (function (_super) {
    __extends(ShippableProduct, _super);
    function ShippableProduct(name, price, quantity, weight) {
        var _this = _super.call(this, name, price, quantity) || this;
        _this.weight = weight;
        return _this;
    }
    ShippableProduct.prototype.getName = function () {
        return this.name;
    };
    ShippableProduct.prototype.getWeight = function () {
        return this.weight;
    };
    return ShippableProduct;
}(Product));
var Customer = /** @class */ (function () {
    function Customer(name, balance) {
        this.name = name;
        this.balance = balance;
    }
    Customer.prototype.pay = function (orderAmount) {
        if (this.balance >= orderAmount) {
            this.balance -= orderAmount;
            return true;
        }
        return false;
    };
    return Customer;
}());
var Cart = /** @class */ (function () {
    function Cart() {
        this.items = [];
    }
    Cart.prototype.add = function (product, quantity) {
        if (product.isAvailable(quantity)) {
            this.items.push({ product: product, quantity: quantity });
        }
        else {
            console.log("We have not enough stock to fulfill your order.");
        }
    };
    Cart.prototype.isEmpty = function () {
        return this.items.length === 0;
    };
    return Cart;
}());
var ShippingService = /** @class */ (function () {
    function ShippingService() {
    }
    ShippingService.ship = function (items) {
        console.log("** Shipment notice **");
        var totalWeight = 0;
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            var product = item.product, quantity = item.quantity;
            var weight = product.getWeight() * quantity;
            totalWeight += weight;
            console.log("".concat(quantity, "x ").concat(product.getName(), " \t ").concat(weight, "g"));
        }
        console.log("Total package weight ".concat((totalWeight / 1000).toFixed(1), "kg\n"));
    };
    return ShippingService;
}());
function isShippable(product) {
    return (typeof product.getName === "function" &&
        typeof product.getWeight === "function");
}
function checkout(customer, cart) {
    if (cart.isEmpty()) {
        console.log("Cart is empty.");
        return;
    }
    var subtotal = 0;
    var shippables = [];
    for (var _i = 0, _a = cart.items; _i < _a.length; _i++) {
        var item = _a[_i];
        var product = item.product, quantity = item.quantity;
        if (product instanceof ExpirableProduct && product.isExpired()) {
            throw new Error("Product \"".concat(product.name, "\" is expired."));
        }
        if (!product.isAvailable(quantity)) {
            throw new Error("Product \"".concat(product.name, "\" is out of stock."));
        }
        subtotal += product.price * quantity;
        if (isShippable(product)) {
            shippables.push({ product: product, quantity: quantity });
        }
    }
    var shippingFee = shippables.length > 0 ? 30 : 0;
    var total = subtotal + shippingFee;
    if (!customer.pay(total)) {
        throw new Error("Insufficient balance.");
    }
    for (var _b = 0, _c = cart.items; _b < _c.length; _b++) {
        var item = _c[_b];
        item.product.reduceQuantity(item.quantity);
    }
    if (shippables.length > 0) {
        ShippingService.ship(shippables);
    }
    console.log("** Checkout receipt **");
    for (var _d = 0, _e = cart.items; _d < _e.length; _d++) {
        var item = _e[_d];
        console.log("".concat(item.quantity, "x ").concat(item.product.name, " \t ").concat(item.product.price * item.quantity));
    }
    console.log("----------------------");
    console.log("Subtotal \t ".concat(subtotal));
    console.log("Shipping \t ".concat(shippingFee));
    console.log("Amount \t\t ".concat(total));
    console.log("Remaining Balance \t ".concat(customer.balance));
}
// ==== Test Example ====
var cheese = new ExpirableProduct("Cheese", 100, 10, "2025-12-31");
var biscuits = new ShippableProduct("Biscuits", 150, 5, 700);
var scratchCard = new Product("Scratch Card", 50, 20);
var tv = new ShippableProduct("TV", 300, 3, 2000);
var customer = new Customer("Mohamed", 1000);
var cart = new Cart();
cart.add(cheese, 2);
cart.add(biscuits, 1);
cart.add(scratchCard, 1);
checkout(customer, cart);
