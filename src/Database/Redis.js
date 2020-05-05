'use strict';

var ioredis = require('ioredis');

ioredis.Command.setReplyTransformer('hgetall', function (result) {
  var arr = [];
  for (var i = 0; i < result.length; i += 2) {
    arr.push({ key: result[i], value: result[i + 1] });
  }
  return arr;
});

exports._handleBlockingPopResult = function(onError, onSuccess) {
  return function(err, val) {
    if (err !== null) {
      onError(err);
      return;
    }
    if(val !== null) {
      var key = val[0], value = val[1];
      onSuccess({key: key, value: value});
      return;
    }
    onSuccess(null);
  };
};

exports.blpopImpl = function(conn) {
  return function(keys) {
    return function(timeout) {
      return function(onError, onSuccess) {
        var handler = exports._handleBlockingPopResult(onError, onSuccess);
        conn.blpopBuffer.apply(conn, [keys, timeout, handler]);
        return function(cancelError, cancelerError, cancelerSuccess) {
          cancelError();
        };
      };
    };
  };
};

exports.brpopImpl = function(conn) {
  return function(keys) {
    return function(timeout) {
      return function(onError, onSuccess) {
        var handler = exports._handleBlockingPopResult(onError, onSuccess);
        conn.brpopBuffer.apply(conn, [keys, timeout, handler]);
        return function(cancelError, cancelerError, cancelerSuccess) {
          cancelError();
        };
      };
    };
  };
};

exports.connectImpl = function(connstr) {
  return function(onError, onSuccess) {
    var redis = new ioredis(connstr);
    redis.connect(function() {
      onSuccess(redis);
    });
    return function(cancelError, cancelerError, cancelerSuccess) {
      cancelError();
    };
  };
};

exports.disconnectImpl = function(conn) {
  return function(onError, onSuccess) {
    conn.disconnect();
    onSuccess();
    return function(cancelError, cancelerError, cancelerSuccess) {
      cancelError();
    };
  };
};

exports.delImpl = function(conn) {
  return function(keys) {
    return function(onError, onSuccess) {
      if (keys.length === 0) {
        onSuccess();
      } else {
        conn.del.apply(conn, keys.concat([function(err) {
          if (err !== null) {
            onError(err);
            return;
          }
          onSuccess();
        }]));
      }
      return function(cancelError, cancelerError, cancelerSuccess) {
        cancelError();
      };
    };
  };
};

exports.flushdbImpl = function(conn) {
  return function(onError, onSuccess) {
    conn.flushdb();
    onSuccess();
    return function(cancelError, cancelerError, cancelerSuccess) {
      cancelError();
    };
  };
};

exports.getImpl = function(conn) {
  return function(key) {
    return function(onError, onSuccess) {
      conn.getBuffer(key, function(err, value) {
        if (err !== null) {
          onError(err);
          return;
        }
        onSuccess(value);
      });
      return function(cancelError, cancelerError, cancelerSuccess) {
        cancelError();
      };
    };
  };
};

exports.hgetallImpl = function(conn) {
  return function(key) {
    return function(onError, onSuccess) {
      conn.hgetallBuffer(key, function(err, value) {
        if (err !== null) {
          onError(err);
          return;
        }
        onSuccess(value);
      });
      return function(cancelError, cancelerError, cancelerSuccess) {
        cancelError();
      };
    };
  };
};

exports.hgetImpl = function(conn) {
  return function(key) {
    return function(field) {
      return function(onError, onSuccess) {
        conn.hgetBuffer(key, field, function(err, value) {
          if (err !== null) {
            onError(err);
            return;
          }
          onSuccess(value);
        });
        return function(cancelError, cancelerError, cancelerSuccess) {
          cancelError();
        };
      };
    };
  };
};

exports.hsetImpl = function(conn) {
  return function(key) {
    return function(field) {
      return function(value) {
        return function(onError, onSuccess) {
          conn.hsetBuffer(key, field, value, function(err, value) {
            if (err !== null) {
              onError(err);
              return;
            }
            onSuccess(parseInt(value));
          });
          return function(cancelError, cancelerError, cancelerSuccess) {
            cancelError();
          };
        };
      };
    };
  };
};

exports.incrImpl = function(conn) {
  return function(key) {
    return function(onError, onSuccess) {
      conn.incr(key, function(err, value) {
        if (err !== null) {
          onError(err);
          return;
        }
        onSuccess(value);
      });
      return function(cancelError, cancelerError, cancelerSuccess) {
        cancelError();
      };
    };
  };
};

exports.keysImpl = function(conn) {
  return function(pattern) {
    return function(onError, onSuccess) {
      conn.keysBuffer(pattern, function(err, value) {
        if (err !== null) {
          onError(err);
          return;
        }
        onSuccess(value);
      });
      return function(cancelError, cancelerError, cancelerSuccess) {
        cancelError();
      };
    };
  };
};

exports.lpopImpl = function(conn) {
  return function(key) {
    return function(onError, onSuccess) {
      var handler = exports._plainValueHandler(onError, onSuccess);
      conn.lpopBuffer.apply(conn, [key, handler]);
      return function(cancelError, cancelerError, cancelerSuccess) {
        cancelError();
      };
    };
  };
};

exports.lpushImpl = function(conn) {
  return function(key) {
    return function(value) {
      return function(onError, onSuccess) {
        var handler = exports._intHandler(onError, onSuccess, false);
        conn.lpushBuffer.apply(conn, [key, value, handler]);
        return function(cancelError, cancelerError, cancelerSuccess) {
          cancelError();
        };
      };
    };
  };
};

exports.rpopImpl = function(conn) {
  return function(key) {
    return function(onError, onSuccess) {
      var handler = exports._plainValueHandler(onError, onSuccess);
      conn.rpopBuffer.apply(conn, [key, handler]);
      return function(cancelError, cancelerError, cancelerSuccess) {
        cancelError();
      };
    };
  };
};

exports.rpushImpl = function(conn) {
  return function(key) {
    return function(value) {
      return function(onError, onSuccess) {
        var handler = exports._intHandler(onError, onSuccess, false);
        conn.rpushBuffer.apply(conn, [key, value, handler]);
        return function(cancelError, cancelerError, cancelerSuccess) {
          cancelError();
        };
      };
    };
  };
};

exports.lrangeImpl = function(conn) {
  return function(key) {
    return function(start) {
      return function(end) {
        return function(onError, onSuccess) {
          var handler = exports._plainValueHandler(onError, onSuccess);
          conn.lrangeBuffer.apply(conn, [key, start, end, handler]);
          return function(cancelError, cancelerError, cancelerSuccess) {
            cancelError();
          };
        };
      };
    };
  };
};

exports._plainValueHandler = function(onError, onSuccess) {
  return function(err, val) {
    if (err !== null) {
      onError(err);
      return;
    }
    onSuccess(val);
  };
};

exports._nullValueHandler = function(onError, onSuccess) {
  return function(err, val) {
    if (err !== null) {
      onError(err);
      return;
    }
    onSuccess(null);
  };
};

exports.ltrimImpl = function(conn) {
  return function(key) {
    return function(start) {
      return function(end) {
        return function(onError, onSuccess) {
          var handler = exports._nullValueHandler(onError, onSuccess);
          conn.ltrimBuffer.apply(conn, [key, start, end, handler]);
          return function(cancelError, cancelerError, cancelerSuccess) {
            cancelError();
          };
        };
      };
    };
  };
};

exports.mgetImpl = function(conn) {
  return function(keys) {
    return function(onError, onSuccess) {
      conn.mgetBuffer(keys, function(err, value) {
        if (err !== null) {
          onError(err);
          return;
        }
        onSuccess(value);
      });
      return function(cancelError, cancelerError, cancelerSuccess) {
        cancelError();
      };
    };
  };
};

exports.setImpl = function(conn) {
  return function(key) {
    return function(value) {
      return function(expire) {
        return function(write) {
          return function(onError, onSuccess) {
            var handler = function(err) {
              if (err !== null) {
                onError(err);
                return;
              }
              onSuccess();
            };
            var args = [key, value];
            if(expire !== null) {
              args.push(expire.unit);
              args.push(expire.value);
            }
            if(write !== null) {
              args.push(write);
            }
            args.push(handler);
            conn.set.apply(conn, args);
            return function(cancelError, cancelerError, cancelerSuccess) {
              cancelError();
            };
          };
        };
      };
    };
  };
};

exports.zaddImpl = function(conn) {
  return function(key) {
    return function(writeMode) {
      return function(returnMode) {
        return function(members) {
          return function(onError, onSuccess) {
            var args = [key];
            if(writeMode !== null) {
              args.push(writeMode);
            }
            if(returnMode !== null) {
              args.push(returnMode);
            }
            members.forEach(function(i) {
              args.push(i.score);
              args.push(i.member);
            });
            var handler = function(err, val) {
              if (err !== null) {
                onError(err);
                return;
              }
              onSuccess(val);
            };
            args.push(handler);
            conn.zaddBuffer.apply(conn, args);
            return function(cancelError, cancelerError, cancelerSuccess) {
              cancelError();
            };
          };
        };
      };
    };
  };
};

exports.zcardImpl = function(conn) {
  return function(key) {
    return function(onError, onSuccess) {
      conn.zcardBuffer.apply(conn, [key, exports._intHandler(onError, onSuccess, false)]);
      return function(cancelError, cancelerError, cancelerSuccess) {
        cancelError();
      };
    };
  };
};

exports.zincrbyImpl = function(conn) {
  return function(key) {
    return function(increment) {
      return function(member) {
        return function(onError, onSuccess) {
          var handler = function(err, val) {
            if (err !== null) {
              onError(err);
              return;
            }
            onSuccess(parseFloat(val));
          };
          conn.zincrbyBuffer.apply(conn, [key, increment, member, handler]);
          return function(cancelError, cancelerError, cancelerSuccess) {
            cancelError();
          };
        };
      };
    };
  };
};

exports._intHandler = function(onError, onSuccess, nullable) {
  return function(err, val) {
    if (err !== null) {
      onError(err);
      return;
    }
    if(nullable && val === null) {
      onSuccess(null);
    } else {
      onSuccess(parseInt(val));
    }
    return;
  };
};

exports._sortedSetItemsHanlder = function(onError, onSuccess) {
  return function(err, val) {
    var curr = {}, result = [];
    if (err !== null) {
      onError(err);
      return;
    }
    val.forEach(function(i) {
      if(curr.member === undefined) {
        curr.member = i;
      } else {
        // XXX: I'm not sure if this is safe parsing
        curr.score = parseFloat(i);
        result.push(curr);
        curr = {};
      }
    });
    onSuccess(result);
  };
};

exports.zrangeImpl = function(conn) {
  return function(key) {
    return function(start) {
      return function(stop) {
        return function(onError, onSuccess) {
          var handler = exports._sortedSetItemsHanlder(onError, onSuccess);
          conn.zrangeBuffer.apply(conn, [key, start, stop, 'WITHSCORES', handler]);
          return function(cancelError, cancelerError, cancelerSuccess) {
            cancelError();
          };
        };
      };
    };
  };
};

exports.zrangebyscoreImpl = function(conn) {
  return function(key) {
    return function(min) {
      return function(max) {
        return function(limit) {
          return function(onError, onSuccess) {
            var handler = exports._sortedSetItemsHanlder(onError, onSuccess),
                args =[key, min, max, 'WITHSCORES'];
            if(limit !== null) {
              args.push('LIMIT');
              args.push(limit.offset);
              args.push(limit.count);
            }
            args.push(handler);
            conn.zrangebyscoreBuffer.apply(conn, args);
          };
        };
      };
    };
  };
};

exports.zrankImpl = function(conn) {
  return function(key) {
    return function(member) {
      return function(onError, onSuccess) {
        conn.zrankBuffer.apply(conn, [key, member, exports._intHandler(onError, onSuccess, true)]);
        return function(cancelError, cancelerError, cancelerSuccess) {
          cancelError();
        };
      };
    };
  };
};

exports.zremImpl = function(conn) {
  return function(key) {
    return function(members) {
      return function(onError, onSuccess) {
        conn.zremBuffer.apply(conn, [key, members, exports._intHandler(onError, onSuccess, false)]);
        return function(cancelError, cancelerError, cancelerSuccess) {
          cancelError();
        };
      };
    };
  };
};

exports.zremrangebylexImpl = function(conn) {
  return function(key) {
    return function(min) {
      return function(max) {
        return function(onError, onSuccess) {
          conn.zremrangebylexBuffer.apply(conn, [key, min, max, exports._intHandler(onError, onSuccess, false)]);
          return function(cancelError, cancelerError, cancelerSuccess) {
            cancelError();
          };
        };
      };
    };
  };
};

exports.zremrangebyrankImpl = function(conn) {
  return function(key) {
    return function(start) {
      return function(stop) {
        return function(onError, onSuccess) {
          conn.zremrangebyrankBuffer.apply(conn, [key, start, stop, exports._intHandler(onError, onSuccess, false)]);
          return function(cancelError, cancelerError, cancelerSuccess) {
            cancelError();
          };
        };
      };
    };
  };
};

exports.zremrangebyscoreImpl = function(conn) {
  return function(key) {
    return function(min) {
      return function(max) {
        return function(onError, onSuccess) {
          conn.zremrangebyscoreBuffer.apply(conn, [key, min, max, exports._intHandler(onError, onSuccess, false)]);
          return function(cancelError, cancelerError, cancelerSuccess) {
            cancelError();
          };
        };
      };
    };
  };
};

exports.zrevrangebyscoreImpl = function(conn) {
  return function(key) {
    return function(min) {
      return function(max) {
        return function(limit) {
          return function(onError, onSuccess) {
            var handler = exports._sortedSetItemsHanlder(onError, onSuccess),
                args =[key, min, max, 'WITHSCORES'];
            if(limit !== null) {
              args.push('LIMIT');
              args.push(limit.offset);
              args.push(limit.count);
            }
            args.push(handler);
            conn.zrevrangebyscoreBuffer.apply(conn, args);
          };
        };
      };
    };
  };
};

exports.zscoreImpl = function(conn) {
  return function(key) {
    return function(member) {
      return function(onError, onSuccess) {
        var handler = function(err, val) {
          if (err !== null) {
            onError(err);
            return;
          }
          if(val !== null) {
            onSuccess(parseFloat(val));
          } else {
            onSuccess(val);
          }
        };
        conn.zscoreBuffer.apply(conn, [key, member, handler]);
      };
    };
  };
};

exports.scanStreamImpl = function(conn){
  return function(options){
    return function(tuple){
      return function (onError, onSuccess){
        var stream = conn.scanStream(options) 
        
        // `resultKeys` is an array of strings representing key names.
        // Note that resultKeys may contain 0 keys, and that it will sometimes
        // contain duplicates due to SCAN's implementation in Redis.
        // woody: Should I check for duplicates here or leave it to end user??
        stream.on("data", function(keys){
          onSuccess(tuple(keys)(stream))
        })

        stream.on("error", onError)

        return function (cancelError, cancelerError, cancelerSuccess) {
            cancelerSuccess()
        }
      }
    }
  }
}

exports.hscanStreamImpl = function(conn){
  return function(options){
    return function(hash){
      return function(tuple){
        return function (onError, onSuccess){
          var stream = conn.hscanStream(hash,options) 
          
          // `resultKeys` is an array of strings representing key names.
          // Note that resultKeys may contain 0 keys, and that it will sometimes
          // contain duplicates due to SCAN's implementation in Redis.
          // woody: Should I check for duplicates here or leave it to end user??
          stream.on("data", function(result){
            var arr = [];
            for (var i = 0; i < result.length; i += 2) {
              arr.push({ key: result[i], value: result[i + 1] });
            }
            onSuccess(tuple(arr)(stream))
          })

          stream.on("error", onError)

          return function (cancelError, cancelerError, cancelerSuccess) {
              cancelerSuccess()
          }
        }
      }
    }
  }
}

exports.zscanStreamImpl = function(conn){
  return function(options){
    return function(key){
      return function(tuple){
        return function (onError, onSuccess){
          var stream = conn.zscanStream(key,options) 
          
          // `resultKeys` is an array of strings representing key names.
          // Note that resultKeys may contain 0 keys, and that it will sometimes
          // contain duplicates due to SCAN's implementation in Redis.
          // woody: Should I check for duplicates here or leave it to end user??
          stream.on("data", function(result){
            var arr = [];
            for (var i = 0; i < result.length; i += 2) {
              arr.push({ member: result[i], value: parseFloat(result[i + 1]) });
            }
            onSuccess(tuple(arr)(stream))
          })

          stream.on("error", onError)

          return function (cancelError, cancelerError, cancelerSuccess) {
              cancelerSuccess()
          }
        }
      }
    }
  }
}
