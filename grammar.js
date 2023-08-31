const UNICODE_LETTER = /\p{L}/;
const LETTER = choice(UNICODE_LETTER, ":", "/", "_", "=");

module.exports = grammar({
  name: "authzed",

  extras: ($) => [$.comment, $._whitespace],
  word: ($) => $.identifier,

  rules: {
    source_file: ($) => $.body,
    body: ($) => repeat1(choice($.relation, $.permission, $.block)),

    relation: ($) =>
      seq(
        field("relation", $.relation_literal),
        field("relation_name", $.identifier),
        field("relation_expression", $.rel_expression)
      ),

    permission: ($) =>
      seq(
        field("permission", $.permission_literal),
        field("param_name", $.identifier),
        field("permission_expresssion", $.perm_expression)
      ),

    cel_expression: ($) =>
      choice(
        $.identifier
      ),

    parameter: ($) =>
      seq(
        $.identifier,
        $.cel_type
      ),

    parameters: ($) =>
      seq(
        $.parameter_start,
        optional(seq($.parameter, repeat(seq($.comma_literal, $.parameter)))),
        $.parameter_end
      ),

    block: ($) =>
      seq(
        $.identifier,
        repeat(choice($.slash_literal, $.identifier)),
        optional($.parameters),
        $.block_start,
        optional(repeat(choice($.relation, $.permission, $.cel_expression))),
        $.block_end
      ),

    perm_expression: ($) =>
      prec.right(repeat1(choice($.identifier, $.plus_literal, $.stabby))),

    rel_expression: ($) =>
      prec.right(repeat1(choice($.identifier, $.pipe_literal, $.hash_literal))),

    cel_type: ($) =>
      choice(
        "any",
        "int",
        "uint",
        "bool",
        "string",
        "double",
        "bytes",
        "duration",
        "timestamp",
        "ipaddress",
        seq("list<", $.cel_type, ">"),
        seq("map<", $.cel_type, ">"),
      ),

    caveat_literal: (_$) => "caveat",
    relation_literal: (_$) => "relation",
    permission_literal: (_$) => "permission",
    definition_literal: (_$) => "definition",

    plus_literal: (_$) => "+",
    pipe_literal: (_$) => "|",
    slash_literal: (_$) => "/",
    stabby: (_$) => "->",
    parameter_start: (_$) => "(",
    parameter_end: (_$) => ")",
    block_start: (_$) => "{",
    block_end: (_$) => "}",
    equal_literal: (_$) => "=",
    hash_literal: (_$) => "#",
    comma_literal: (_$) => ",",

    identifier: (_$) =>
      token(seq(LETTER, repeat(choice(LETTER, UNICODE_LETTER)))),

    comment: (_$) =>
      token(
        choice(seq("//", /.*/), seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/"))
      ),

    _whitespace: (_$) => token(/\s/),
  },
});
