const mongodb = require("mongodb");

const getDb = require("../util/database").getDb;

class User {
  constructor({ name, email, cart, id }) {
    this.name = name;
    this.email = email;
    this.cart = cart; // { items: [] }
    this._id = id;
  }

  save() {
    const db = getDb();
    return db
      .collection("users")
      .insertOne(this)
      .then(() => {
        console.log("User Saved!");
      })
      .catch((err) => console.log({ saveUserErr: err }));
  }

  addToCart(product) {
    const db = getDb();

    const cartProductIndex = this.cart.items.findIndex(
      (item) => item.productId.toString() === product._id.toString(),
    );

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new mongodb.ObjectId(product._id),
        quantity: 1,
      });
    }
    const updatedCart = {
      items: updatedCartItems,
    };

    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: updatedCart } },
      )
      .then((user) => {
        return user;
      })
      .catch((err) => console.log({ addToCartErr: err }));
  }

  getCart() {
    const db = getDb();
    const productIds = [...this.cart.items].map((item) => item.productId);
    return db
      .collection("products")
      .find({ _id: { $in: [...productIds] } })
      .toArray()
      .then((products) => {
        return products.map((prod) => ({
          ...prod,
          quantity: this.cart.items.find(
            (item) => item.productId.toString() === prod._id.toString(),
          )?.quantity,
        }));
      })
      .catch((err) => console.log({ getCartUserErr: err }));
  }

  deleteItemFromCart(productId) {
    const db = getDb();
    const updatedCartItems = [...this.cart.items].filter(
      (item) => item.productId.toString() !== productId.toString(),
    );

    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } },
      )
      .catch((err) => console.log({ deleteItemFromCartUserErr: err }));
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: new mongodb.ObjectId(this._id),
            name: this.name,
          },
        };

        return db.collection("orders").insertOne(order);
      })
      .then((result) => {
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne(
            { _id: new mongodb.ObjectId(this._id) },
            { $set: { cart: { items: [] } } },
          );
      })
      .then(() => {
        console.log("Order Created!");
      })
      .catch((err) => console.log({ saveUserErr: err }));
  }

  getOrders() {
    const db = getDb();
    return db
      .collection("orders")
      .find({ 'user._id': new mongodb.ObjectId(this._id) })
      .toArray()
      .then((orders) => {
        return orders;
      })
      .catch((err) => console.log({ getOrdersUserErr: err }));
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(userId) })
      .then((user) => {
        console.log({ user });
        return user;
      })
      .catch((err) => console.log({ findByIdUserErr: err }));
  }
}

module.exports = User;
