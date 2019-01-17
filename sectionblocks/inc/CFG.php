<?php

namespace sectionblock;

/**
 * CFG class
 *
 * @since  1.0
 */
class CFG {
	
	/**
	 * Holds data from JSON config.
	 *
	 * @since  1.0
	 *
	 * @var array
	 */
	protected $CFG = array();
	
	/**
	 * CFG constructor. If not passed an array of paths looks to see if a 'cfg' directory exists.
	 *
	 * @since  1.0
	 *
	 * @param array $paths  Optional array of paths to check for JSON config files
	 */
	public function __construct( $paths = [] ) {
		
		if ( ! empty( $paths ) ) {
			$this->CFG = $this->json_cfg( $paths );
		}
	}
	
	/**
	 * Adds a directory of config to $this->CFG. Note that new will overwrite the old if file names are the same.
	 *
	 * @since  1.0
	 *
	 * @param string $path  Path to add to configured paths
	 */
	public function add_directory( $path ) {
		
		$this->CFG = $this->json_cfg( [ $path ], $this->CFG );
	}
	
	/**
	 * This config object uses "dots" format to find array values. This helper function accepts a dots string and
	 * an array to search and returns the matching value if it is present, or null if not.
	 *
	 *   $key = 'a.b.c'
	 *   $array = [
	 *     'a' => [
	 *       'b' => [
	 *         'c' => 'dork'
	 *       ]
	 *     ]
	 *   ]
	 *
	 * returns 'dork'
	 *
	 * Checks if a numerically indexed array contains a key matching $key, as well.
	 *
	 * Returns null if nothing is found to allow 'false' and empty values to be returned.
	 *
	 * @since 1.0
	 *
	 * @param string       $key   : In dots format, or can be empty to return entire $array
	 * @param array|object $array : Array to check against
	 *
	 * @return mixed
	 */
	public function dots( $key, $array ) {
		
		$ret = NULL;
		
		if ( $key === '' ) {
			return $array;
		}
		
		$dots = explode( '.', $key );
		$dot  = array_shift( $dots );
		$key  = implode( '.', $dots );
		
		$key = is_numeric( $key ) ? intval( $key ) : $key;
		
		$check = is_array( $array ) ? isset( $array[ $dot ] ) : property_exists( $array, $dot );
		$val   = is_array( $array ) ? ( $check ? $array[ $dot ] : NULL ) : ( $check ? $array->{$dot} : NULL );
		
		if ( $check && ( ! empty( $key ) || $key === 0 ) && is_iterable( $val ) ) {
			
			$ret = $this->dots( $key, $val );
			
		} else if ( $check && ( empty( $key ) && $key !== 0 ) ) {
			
			$ret = $val;
		}
		
		return $ret;
	}
	
	/**
	 * Public getter of config data
	 *
	 * @since  1.0
	 *
	 * @param string $dots : "dots" formatted string. If empty, returns entire CFG array
	 * @param string $txt
	 *
	 * @return mixed
	 */
	public function get( $dots = '', $txt = 'txt' ) {
		
		$ret = empty( $dots ) ? $this->CFG : $this->dots( $dots, $this->CFG );
		
		return $txt ? $this->txt( $ret, $txt ) : $ret;
	}
	
	/**
	 * Returns array keys
	 *
	 * @since  1.0
	 *
	 * @param string $dots : Returns the array keys for a specific "dots" request
	 *
	 * @return array
	 */
	public function keys( $dots = '' ) {
		
		$array = $dots ? $this->dots( $dots, $this->CFG ) : $this->CFG;
		
		return array_keys( $array );
	}
	
	/**
	 * Recursive data merging
	 * All keys from both arrays are returned, but when values are shared, $a takes priority.
	 * Nulls are always replaced when keys match and one is not null.
	 *
	 * @param array $a               : "lead" array; values always take precendence
	 * @param array $b               : 'following' array; only non-shared keys will be returned
	 * @param bool  $replace_empty_a : If true, scalar vals: if $a[x] is empty and $b[x] is not, $b[x] replaces $a[x].
	 * @param bool  $allow_empty_b   : If true, scalar vals: if $b[x] is set and is empty, replaces $a[x].
	 * @param bool  $type_match      : If true, the type of $b[x] must match type of $a[x] if $a[x] is set.
	 *
	 * @since  1.0
	 *
	 * @return array
	 */
	public function parse_args_r( &$a, $b, $replace_empty_a = TRUE, $allow_empty_b = FALSE, $remove_a = FALSE, $type_match = FALSE ) {
		
		$a = is_array( $a ) ? $a : (array) $a;
		$b = is_array( $b ) ? $b : (array) $b;
		$r = $b;
		
		foreach ( $a as $ak => &$av ) {
			
			// we're returning $r (a copy of $b), so this keeps $b's value intact
			if ( $replace_empty_a && empty( $av ) && ! empty( $r[ $ak ] ) && $av !== null ) {
				continue;
			}
			
			// $a is not empty but $b is, the allow empty $b flag is set, and $b is not null
			if ( $allow_empty_b && isset( $r[ $ak ] ) && empty( $r[ $ak ] ) && $r[ $ak ] !== null ) {
				continue;
			}
			
			if ( $remove_a && ! isset( $r[ $ak ] ) ) {
				continue;
			}
			
			// the type match flag is set, and the types don't match
			if ( $type_match && isset( $r[ $ak ] ) && $av !== null && gettype( $r[ $ak ] ) !== gettype( $av ) ) {
				$r[ $ak ] = $av;
				continue;
			}
			
			$r[ $ak ] = ( is_array( $av ) && isset( $r[ $ak ] ) ) ?
				$this->parse_args_r( $av, $r[ $ak ], $replace_empty_a, $allow_empty_b, $type_match ) : $av;
		}
		
		return $r;
	}
	
	/**
	 * Removes a key from this->CFG, even if nested
	 *
	 * @param $root_dots
	 * @param $key
	 */
	public function remove( $root_dots, $key ) {
		
		$keys = explode( '.', $root_dots );
		$orig = $this->CFG;
		
		$this->remove_recurse( $orig, $key, $keys );
	
		$this->CFG = $orig;
	}
	
	/**
	 * Recursive function to remove nested element from array.
	 *
	 * @param     $array
	 * @param     $key
	 * @param     $keys
	 * @param int $depth
	 */
	public function remove_recurse( &$array, $key, $keys, $depth = 1 ) {
		foreach( $array as $array_key => &$array_value ) {
			if ( $depth > count( $keys ) ) {
				continue;
			} else if ( $depth === count( $keys ) && $array_key === $key && isset( $array[ $key ]) ) {
				unset( $array[ $key ] );
			} else if ( is_array( $array_value ) && $array_key === $keys[ $depth - 1 ] ) {
				$this->remove_recurse( $array_value, $key, $keys, $depth ++ );
			}
		}
	}
	
	/**
	 * Substitutes tokens in arrays. Method is recursive, and can check keys. Note that this returns a copy
	 * of the original array. It only looks for literal string tokens and has no error-checking or compensation.
	 *
	 * If the token value is not scalar and the token is found in the array value, the **entire string** the token is
	 * embedded within will be replaced by the token, as such:
	 *
	 *   $tokens = [
	 *     '{MYTOKEN}' => [ 'hm' ],
	 *     '{ANOTHER}' => 'Howdy'
	 *   ]
	 *
	 *   $array  = [
	 *     'key1'      => '{MYTOKEN} is neat',
	 *     'key2'      => '{ANOTHER} partner',
	 *     '{ANOTHER}' => '{MYTOKEN}'
	 *   ]
	 *
	 *   returns [
	 *     'key1'      => array( 'hm' ),     <-- Note substitution!
	 *     'key2'      => 'Howdy partner',
	 *     '{ANOTHER}' => array( 'hm' )
	 *   ]
	 *
	 * Tokens in keys are not evaluated unless '$keys' is set to true. If set, the above becomes:
	 *
	 *   returns [
	 *     'key1'      => array( 'hm' ),
	 *     'key2'      => 'Howdy partner',
	 *     'Howdy'     => array( 'hm' )
	 *   ]
	 *
	 * Key replacement only happens when the value of the token is a string or number.
	 *
	 * You can pass the name of a WordPress filter to apply to the tokens array with the optional 4th param.
	 *
	 * @since  1.0
	 *
	 * @param array  $array  : Array to check for tokens.
	 * @param array  $tokens : Tokens.
	 * @param bool   $keys   : Whether to look for tokens in the array keys.
	 *
	 * @return array
	 */
	public function replace_tokens_in_array( $array = [], $tokens = [], $keys = FALSE ) {
		
		if ( empty( $array ) || empty( $tokens ) || ! is_array( $array ) || ! is_array( $tokens ) ) {
			return $array;
		}
		
		$return = [];
		
		foreach ( $array as $a => $value ) {
			
			$ret_key = $a;
			$ret_val = $value;
			
			if ( is_string( $ret_val ) ) {
				
				foreach ( $tokens as $t => $token ) {
					
					if ( is_string( $value ) && strpos( $value, $t ) !== FALSE ) {
						
						if ( ! is_scalar( $token ) || is_bool( $token ) ) {
							
							$ret_val = $token;
							
						} else {
							
							$ret_val = str_replace( $t, (string) $token, $ret_val );
						}
					}
				}
				
			} else if ( is_array( $ret_val ) ) {
				
				$ret_val = $this->replace_tokens_in_array( $ret_val, $tokens, $keys );
			}
			
			if ( $keys ) {
				
				foreach ( $tokens as $t => $token ) {
					
					if ( $keys && is_string( $a ) && strpos( $a, $t ) !== FALSE && is_string( $token ) ) {
						
						$ret_key = str_replace( $t, $token, $a );
					}
				}
			}
			
			$return[ $ret_key ] = $ret_val;
		}
		
		return $return;
	}
	
	/**
	 * Public setter
	 *
	 * @since  1.0
	 *
	 * @param string $dots  : Where to save the value to ( example: templates.mytemplate.somevar )
	 * @param mixed  $value : The data to save to that location ( example: 234 )
	 *
	 * @return mixed
	 */
	public function set( $dots, $value ) {
		
		$add = $this->dots_to_array( $dots, $value );
		
		$this->CFG = $this->parse_args_r( $add, $this->CFG );
		
		return $this->get( $dots );
	}
	
	/**
	 * Tokenizes the keys of an array. Optionally recursive, with a dot between keys. Returns a flat array with no
	 * numeric keys. Numeric keys are ignored at the top level, and joined with a comma at lower levels when recursing.
	 *
	 * [
	 *  howdy => [
	 *   a => 1,
	 *   b => [ 8, 9 ],
	 *   67 => 'hi'
	 *   98 => 'there'
	 *  ],
	 *  c = 3,
	 *  99 => 'oops'
	 * ]
	 *
	 * returns
	 *
	 * [
	 *  {{howdy}} => "hi,there",
	 *  {{howdy.a}} => "1",
	 *  {{howdy.b}} => "8,9",
	 *  {{c}} => "3"
	 * ]
	 *
	 * @since  1.0
	 *
	 * @param array  $tokens          : Array to tokenize
	 * @param string $prefix          : Adds a prefix to the tokens
	 * @param bool   $recurse         : Whether this method was called recursively
	 * @param bool   $ignore_numeric  : Whether to ignore plain array values or not (ie, insert plain array as value)
	 *
	 * @return mixed
	 */
	public function tokenize( $tokens, $prefix = '', $recurse = FALSE, $ignore_numeric = false ) {
		
		if ( ! is_array( $tokens ) ) {
			return [];
		}
		
		foreach ( $tokens as $k => $v ) {
			
			if ( is_scalar( $v ) ) {
				
				if ( is_string( $k ) && strpos( $k, '{{' ) === 0 ) {
					continue;
				}
				
				$tk = $this->tokenize_key( $prefix, $k, true, $ignore_numeric );
				
				if ( is_string( $k ) || ( is_numeric( $k ) && ! $ignore_numeric )  ) {
					
					$tokens[ $tk ] = $v;
					
				} else if ( is_numeric( $k ) && $prefix && $ignore_numeric ) {
					
					$tokens[ $tk ] = ! empty( $tokens[ $tk ] ) ? $tokens[ $tk ] . ',' : '';
					$tokens[ $tk ] .= $v;
				}
				
			} else if ( is_array( $v ) && $recurse ) {
				
				$pre       = $this->tokenize_key( $prefix, $k, FALSE, $ignore_numeric );
				$subtokens = $this->tokenize( $v, $pre, $recurse, $ignore_numeric );
				$tokens    = empty( $subtokens ) ? $tokens : $subtokens + $tokens;
			}
			
			if ( ( is_numeric( $k ) && ! $ignore_numeric ) || strpos( $k, '{{' ) !== 0 ) {

				unset( $tokens[ $k ] );
			}
		}
		
		return $tokens;
	}
	
	/**
	 * Looks for a key, and if that content is an array, implodes the array.
	 *
	 * @param        $array
	 * @param string $text_key
	 *
	 * @return array
	 */
	public function txt( $array, $text_key = 'txt' ) {
		
		if ( ! is_array( $array ) ) {
			return $array;
		}
		
		foreach ( $array as $key => $val )  {
			
			if ( is_array( $val ) && $key !== $text_key ) {
				$array[ $key ] = $this->txt( $val );
			} else if ( $key === $text_key && is_array( $val ) ) {
				$array[ $key ] = implode( ' ', $val );
			}
		}
		
		return $array;
	}
	
	/* PROTECTED METHODS *********************************************************************************************/
	
	/**
	 * Reciprocal method to allow dots-referenced values to be inserted into an array.
	 *
	 * $dots  = 'a.b.c'
	 * $value = 'whatever'
	 *
	 * returns [
	 *   'a' => [
	 *     'b' => [
	 *       'c' => 'whatever'
	 *     ]
	 *   ]
	 * ]
	 *
	 * @since  1.0
	 *
	 * @param string $dots  : The "dots" key
	 * @param mixed  $value : Value to save
	 *
	 * @return array
	 */
	protected function dots_to_array( $dots, $value ) {
		
		$ex = explode( '.', $dots );
		
		while ( ! empty( $ex ) ) {
			$inner = array_pop( $ex );
			$array = [ $inner => $value ];
			$value = $array;
		}
		
		return $value;
	}
	
	/**
	 * Either:
	 * - reads JSON from disk from passed array of paths
	 * - adds passed JSON-encoded string to passed config array
	 *
	 * @since  1.0
	 *
	 * @param array|string $cfg : Either an array of paths or a JSON encoded string
	 * @param array        $CFG : Optional - Existing configuration array if passing a string
	 * @param string       $key : Optional - Key to add to
	 *
	 * @return mixed
	 */
	protected function json_cfg( $cfg, $CFG = [], $key = '' ) {
		
		$test = is_string( $cfg ) ? json_decode( $cfg, TRUE ) : NULL;
		
		if ( $test === NULL ) {
			
			$cfg = $this->read_json_from_disk( $cfg );
			$CFG = $this->parse_args_r( $cfg, $CFG );
			
		} else if ( $key && $test ) {
			
			$CFG[ $key ] = $test;
			
		} else if ( $test ) {
			
			$CFG = $test;
		}
		
		return $CFG;
	}
	
	/**
	 * Reads JSON from disk given an array of paths. Each JSON file will be added to resulting config array
	 * using the filename(s) minus '.json' as the root key(s).
	 *
	 * Paths can be individual files, or a directory. If a directory, all JSON files in that directory will be added
	 * without recursing into sub-directories.
	 *
	 * $paths = [
	 *   '../foo.json',
	 *   '../cfg_dir'
	 * ]
	 *
	 * returns (assuming valid JSON is found, and cfg_dir contained 'bar.json' and 'baz.json'):
	 *
	 * [
	 *   'foo' => [...] ,
	 *   'bar' => [...] ,
	 *   'baz' => [...]
	 * ]
	 *
	 * @since  1.0
	 *
	 * @param  array $paths : array of paths
	 *
	 * @return array
	 */
	protected function read_json_from_disk( $paths ) {
		
		$json  = [];
		$add_parent = [];
		$paths = ! is_array( $paths ) ? (array) $paths : $paths;
		
		foreach ( $paths as $path ) {
			
			if ( ! is_dir( $path ) && file_exists( $path ) ) {
				
				$read = $this->read_json_cfg( $path );
				$json = ! empty( $json ) ? $this->parse_args_r( $read, $json ) : $read;
				
			} else if ( is_dir( $path ) ) {
				
				$dh = opendir( $path );
				$base = basename( $path );
				
				while ( ( $file = readdir( $dh ) ) !== FALSE ) {
					
					if ( $file != "." && $file != ".." && ! is_dir( $path . $file ) ) {
						
						$ext = substr( strrchr( $file, "." ), 1 );
						
						// skip non-json files
						if ( $ext !== 'json' ) {
							continue;
						}
						
						// key is the filename minus extension
						$key = substr( $file, 0, ( strlen( $file ) - 5 ) );
						
						// keys with underscores as first character do not get merged
						$nomerge = FALSE;
						if ( substr( $file, 0, 1 ) == '_' ) {
							$key     = ltrim( $key, '_' );
							$nomerge = TRUE;
						}
						
						$read = $this->read_json_cfg( $path . $file );
						
						if ( in_array( $base, $add_parent ) ) {
						
							$json[ $base ] = ! isset( $json[ $base ] ) ? [] : $json[ $base ];
							
							$json[ $base ][ $key ] = ! empty( $json[ $base ][ $key ] ) && ! $nomerge ?
								$this->parse_args_r( $read, $json[ $base ][ $key ] ) :
								$read;
							
						} else {
							
							$json[ $key ] = ! empty( $json[ $key ] ) && ! $nomerge ?
								$this->parse_args_r( $read, $json[ $key ] ) :
								$read;
						}
						
					} else if ( $file != "." && $file != ".." && is_dir( $path . $file ) ) {
					
						$json[ $file ] = $this->read_json_from_disk( [ $path . $file ] );
					}
				}
				
				closedir( $dh );
			}
		}
		
		return $json;
	}
	
	/**
	 * Reads file from disk. If not valid JSON or file doesn't exist, returns empty array.
	 *
	 * @since  1.0
	 *
	 * @param string $file : full path on disk to JSON file
	 *
	 * @return array|mixed|object
	 */
	public function read_json_cfg( $file ) {
		
		if ( ! file_exists( $file ) ) {
			return [];
		}
		
		$json = json_decode( file_get_contents( $file ), TRUE );
		
		return $json === NULL ? [] : $json;
	}
	
	/**
	 * Generates the token name
	 *
	 * @since  1.0
	 *
	 * @param string $prefix          : Prefix to add to key
	 * @param string $key             : Key being tokenized
	 * @param bool   $brackets        : Whether to add brackets to the tokens or not
	 * @param bool   $ignore_numeric  : Set to true, ignores numeric keys when adding prefixes
	 *
	 * @return string
	 */
	protected function tokenize_key( $prefix, $key, $brackets = TRUE, $ignore_numeric = false ) {
		
		$prefix = rtrim( $prefix, '.' );
		
		if ( ! $prefix && ( ! $key || ( is_numeric( $key ) && $ignore_numeric ) ) ) {
			
			// key: numeric or doesn't exit
			// prefix is: none
			$ret = '';
			
		} else if ( $prefix && ( ! $key || ( is_numeric( $key ) && $ignore_numeric ) ) ) {
			
			// key: numeric or doesn't exit
			// prefix is: present
			$ret = $prefix;
			
		} else if ( $key && ! $prefix ) {
			
			// key: string
			// prefix is: none
			$ret = $key;
			
		} else {
			
			// key: string
			// prefix is: present
			$ret = $prefix . '.' . $key;
		}
		
		return $brackets && $ret ? '{{' . $ret . '}}' : $ret;
	}
}