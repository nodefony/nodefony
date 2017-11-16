nodefony.register.call(nodefony.context, "http2", function () {

  const http2 = class http2 extends nodefony.context.http {
    constructor(container, request, response, type) {
      super(container, request, response, type);
    }
  };

  return http2;
});
