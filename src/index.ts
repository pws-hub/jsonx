import path from 'path'
import request from 'request-promise-native'
import Lexer from './lexer'
import Parser from './parser'
import Schema from './schema'
import Compiler from './compiler'
import Formater from './formater'
import { fetchContent, clean } from './utils'

const 
EXTERNAL_URL = /^https?:\/\/(.+)$/,
Imports: any = {}

export const schema = Schema
// export const parse = Formater.parse
// export const stringify = Formater.stringify

export const compile = async ( input: string, source?: string ) => {
  const 
  { tokens, syntaxTree } = Lexer( clean( input ) ),
  { _value } = Parser( tokens )

  return await Compiler( _value, syntaxTree, source )
}

export const render = async ( source: string ) => {
  try {
    let 
    isExternal = false,
    input
    
    // Use cached data
    if( Imports.hasOwnProperty( source ) )
      input = Imports[ source ]
    
    else {
      // Fetch data from external source
      if( EXTERNAL_URL.test( source ) ){
        input = await request( source )
        isExternal = true
      }
      else {
        // Add .jsonx by default to undefined directory file extension
        if( !path.extname( source ) ) source += '.jsonx'
        // Fetch data from project repository
        input = await fetchContent( source )
      }
      
      if( !input ) return null

      // Cache temporary the imported data
      Imports[ source ] = input
    }
    
    return await compile( input, isExternal ? undefined : path.dirname( source ) )
  }
  catch( error: any ){ throw new Error( error || 'Unknown Error' ) }
}

export default async ( filepath: string ) => {
  try { return await render( filepath ) }
  catch( error: any ){ throw new Error( error || 'Unknown Error' ) }
}