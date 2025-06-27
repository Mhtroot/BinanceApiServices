import express, {Request, Response} from 'express'
import { isValidSymbol, subscribeToPrice } from './binance';

const app = express();
const port = 3000;

app.get('/check-symbol/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const isValid = await isValidSymbol(symbol);
    res.json({
        symbol,
        isValid,
    });
});

app.get('/price/:symbol', async (req: Request, res: Response) => {
    const symbol = req.params.symbol.toUpperCase();
    let latestPrice = '0.00';

    if (!(await isValidSymbol(symbol))) {
        res.status(400).json({error : 'invalid symbol'});
        return;
    }

    const ws = subscribeToPrice(symbol, (price) => {
        latestPrice = price;
    });
    

    setTimeout(() => {
        ws.close();
        res.json({
            symbol,
            price: latestPrice,
        });
    }, 2000);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});