import fs from 'fs'
import path from 'path'
import type { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/string',
    method: 'post',
    response: () => {
      return 'string'
    },
  },
  {
    url: '/api/number',
    method: 'post',
    response: () => {
      return 123123
    },
  },
  {
    url: '/api/boolean',
    method: 'post',
    response: () => {
      return true
    },
  },
  {
    url: '/api/map',
    method: 'post',
    response: () => {
      return { a: 1, b: { c: 2, d: [1, 2] } }
    },
  },
  {
    url: '/api/array/string',
    method: 'post',
    response: () => {
      return ['string1', 'string2']
    },
  },
  {
    url: '/api/array/number',
    method: 'post',
    response: () => {
      return [1, 2]
    },
  },
  {
    url: '/api/array/boolean',
    method: 'post',
    response: () => {
      return [true, false]
    },
  },
  {
    url: '/api/array/map',
    method: 'post',
    response: () => {
      return [{ a: 1 }, { a: 2 }]
    },
  },
  {
    url: '/api/audio',
    method: 'post',
    rawResponse: (req, res) => {
      const filePath = path.join(__dirname, './audio1.mp3')
      const stat = fs.statSync(filePath)
      const readStream = fs.createReadStream(filePath)

      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Disposition': 'attachment; filename=audio1.mp3',
      })
      readStream.pipe(res)
    },
  },
  {
    url: '/api/image',
    method: 'post',
    rawResponse: (req, res) => {
      const filePath = path.join(__dirname, './image1.png')
      const stat = fs.statSync(filePath)
      const readStream = fs.createReadStream(filePath)

      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Disposition': 'attachment; filename=image1.png',
      })
      readStream.pipe(res)
    },
  },
  {
    url: '/api/video',
    method: 'post',
    rawResponse: (req, res) => {
      const filePath = path.join(__dirname, './video1.mp4')
      const stat = fs.statSync(filePath)
      const readStream = fs.createReadStream(filePath)

      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Disposition': 'attachment; filename=video1.mp4',
      })
      readStream.pipe(res)
    },
  },
  {
    url: '/api/file',
    method: 'post',
    rawResponse: (req, res) => {
      const filePath = path.join(__dirname, './file1.txt')
      const stat = fs.statSync(filePath)
      const readStream = fs.createReadStream(filePath)

      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Disposition': 'attachment; filename=file1.txt',
      })
      readStream.pipe(res)
    },
  },
] as MockMethod[]
