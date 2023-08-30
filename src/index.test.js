import { Order } from '.';

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
