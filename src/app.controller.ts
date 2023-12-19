import { Body, Controller, Get, Post, Render, Res } from '@nestjs/common';
import * as mysql from 'mysql2';
import { AppService } from './app.service';
import { UjKuponDto } from './ujKupon';
import { Response } from 'express';

const conn = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'szinhaz',
}).promise();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async index() {
    const [ adatok ] = await conn.execute('SELECT id, title, percentage, code FROM kuponok');

    return { 
      kuponok: adatok,
    };
  }

  @Get('/newCoupon')
  @Render('newCoupon')
  ujKupon() {
    return { messages: '' };
  }

  @Post('/newCoupon')
  @Render('newCoupon')
  async ujKuponok(@Body() ujKupon: UjKuponDto, @Res() res: Response) {
    const title = ujKupon.title;
    const percentage = ujKupon.percentage;
    const code = ujKupon.code;

    var codeRegex = /^[A-Za-z]{4}-[0-9]{6}$/g;
    if (codeRegex.test(code)) {
      const [ adatok ] = await conn.execute(
        'INSERT INTO kuponok (title, percentage, code) VALUES (?, ?, ?)',
        [title, percentage, code],
      );
      res.redirect('/');
    }
    else {
      return {
        messages: "A code 4 angol betű - 6 számjegy formátumban adható meg."
      }
    }
  }
}
