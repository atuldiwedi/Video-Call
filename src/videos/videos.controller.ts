import { Controller, Get, Param, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response, Request } from 'express'
import { createReadStream, statSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import {v4 as uuidv4} from "uuid";

@Controller('videos')
export class VideosController {
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) =>{
                const uniqueSuffiix = `${uuidv4()}${extname(file.originalname)}`;
                callback(null, uniqueSuffiix);
            },
        }),
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File){
        console.log(file);
        return {filename: file.filename}
    }
    
    @Get('stream/:filename')
    streamVideo(@Param('filename') filename: string, @Res() res: Response,@Req() req: Request){
        const filePath = join(__dirname, '../..', 'uploads',filename);
        const fileStat = statSync(filePath);
        const fileSize = fileStat.size;

        const range = req.headers.range;
        if(range){
            const parts = range.replace(/bytes=/,'').split('-');
            const start = parseInt(parts[0],10);
            const end = parts[1] ? parseInt(parts[1],10) : fileSize - 1;
            const chunkSize = (end -start) +1;
            const file = createReadStream(filePath, {start,end});
        
        res.set({
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
        })
        res.status(206);
        file.pipe(res);
        // const videoStream = createReadStream(filePath);
        // videoStream.pipe(res)
    }else{
        res.set({
            'Content-Type': 'video/mp4',
            'Content-Length': fileSize,
        })
        const file = createReadStream(filePath);
        file.pipe(res);
    }
    }


}
