
class Product {
  name: string;
  price: number;
  quantity: number;

  constructor(name: string, price: number, quantity: number) {
    this.name = name;
    this.price = price;
    this.quantity = quantity;
  }

  isAvailable(orderedQuantity: number): boolean {
    return this.quantity >= orderedQuantity;
  }

  reduceQuantity(orderedQuantity: number): void {
    this.quantity -= orderedQuantity;
  }
}

class ExpirableProduct extends Product {
  expiryDate: Date;

  constructor(name: string, price: number, quantity: number, expiryDate: string) {
    super(name, price, quantity);
    this.expiryDate = new Date(expiryDate);
  }

  isExpired(): boolean {
    return new Date() > this.expiryDate;
  }
}

interface Shippable {
  getName(): string;
  getWeight(): number;
}

class ShippableProduct extends Product implements Shippable {
  weight: number;

  constructor(name: string, price: number, quantity: number, weight: number) {
    super(name, price, quantity);
    this.weight = weight;
  }

  getName(): string {
    return this.name;
  }

  getWeight(): number {
    return this.weight;
  }
}

class Customer {
  name: string;
  balance: number;

  constructor(name: string, balance: number) {
    this.name = name;
    this.balance = balance;
  }

  pay(orderAmount: number): boolean {
    if (this.balance >= orderAmount) {
      this.balance -= orderAmount;
      return true;
    }
    return false;
  }
}

type CartItem = { product: Product; quantity: number };

class Cart {
  items: CartItem[];

  constructor() {
    this.items = [];
  }

  add(product: Product, quantity: number): void {
    if (product.isAvailable(quantity)) {
      this.items.push({ product, quantity });
    } else {
      console.log("We have not enough stock to fulfill your order.");
    }
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

class ShippingService {
  static ship(items: { product: Shippable; quantity: number }[]): void {
    console.log("** Shipment notice **");
    let totalWeight = 0;

    for (const item of items) {
      const { product, quantity } = item;
      const weight = product.getWeight() * quantity;
      totalWeight += weight;
      console.log(`${quantity}x ${product.getName()} 	 ${weight}g`);
    }

    console.log(`Total package weight ${(totalWeight / 1000).toFixed(1)}kg\n`);
  }
}

function isShippable(product: any): product is Shippable {
  return (
    typeof product.getName === "function" &&
    typeof product.getWeight === "function"
  );
}

function checkout(customer: Customer, cart: Cart): void {
  if (cart.isEmpty()) {
    console.log("Cart is empty.");
    return;
  }

  let subtotal = 0;
  const shippables: { product: Shippable; quantity: number }[] = [];

  for (const item of cart.items) {
    const { product, quantity } = item;

    if (product instanceof ExpirableProduct && product.isExpired()) {
      throw new Error(`Product "${product.name}" is expired.`);
    }

    if (!product.isAvailable(quantity)) {
      throw new Error(`Product "${product.name}" is out of stock.`);
    }

    subtotal += product.price * quantity;

    if (isShippable(product)) {
      shippables.push({ product, quantity });
    }
  }

  const shippingFee = shippables.length > 0 ? 30 : 0;
  const total = subtotal + shippingFee;

  if (!customer.pay(total)) {
    throw new Error("Insufficient balance.");
  }

  for (const item of cart.items) {
    item.product.reduceQuantity(item.quantity);
  }

  if (shippables.length > 0) {
    ShippingService.ship(shippables);
  }

  console.log("** Checkout receipt **");
  for (const item of cart.items) {
    console.log(`${item.quantity}x ${item.product.name} \t ${item.product.price * item.quantity}`);
  }
  console.log("----------------------");
  console.log(`Subtotal \t ${subtotal}`);
  console.log(`Shipping \t ${shippingFee}`);
  console.log(`Amount \t\t ${total}`);
  console.log(`Remaining Balance \t ${customer.balance}`);
}

// ==== Test Example ====
const cheese = new ExpirableProduct("Cheese", 100, 10, "2025-12-31");
const biscuits = new ShippableProduct("Biscuits", 150, 5, 700);
const scratchCard = new Product("Scratch Card", 50, 20);
const tv = new ShippableProduct("TV", 300, 3, 2000);

const customer = new Customer("Mohamed", 1000);
const cart = new Cart();

cart.add(cheese, 2);
cart.add(biscuits, 1);
cart.add(scratchCard, 1);

checkout(customer, cart);
