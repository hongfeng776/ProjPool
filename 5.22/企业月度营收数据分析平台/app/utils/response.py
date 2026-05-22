from flask import jsonify

def success_response(data=None, message='success', code=200):
    response = {
        'code': code,
        'message': message,
        'data': data
    }
    return jsonify(response), code

def error_response(message='error', code=500, data=None):
    response = {
        'code': code,
        'message': message,
        'data': data
    }
    return jsonify(response), code
