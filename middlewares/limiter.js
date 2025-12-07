import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // এক মিনিটে max 100 requests
  message: "Too many requests, please try again later.",
});

app.use(limiter); // সব routes এ apply
