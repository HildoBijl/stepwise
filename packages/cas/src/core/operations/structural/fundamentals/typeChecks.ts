import { type RootLike, type LogLike, ExpressionNode, ConstantNode, SignNode, ListNode, FunctionNode, SingleArgumentFunctionNode, Integer, Float, NamedConstant, Minus, PlusMinus, Variable, Sum, Product, Fraction, Power, Root, Sqrt, Ln, Log, Sin, Cos, Tan, Arcsin, Arccos, Arctan, TrigonometricFunction, InverseTrigonometricFunction, TrigonometryLike } from '../../../construction'

// Abstract types.
export function isExpressionNode(value: unknown): value is ExpressionNode { return value instanceof ExpressionNode }
export function isConstantNode(node: ExpressionNode): node is ConstantNode { return node instanceof ConstantNode }
export function isNumberNode(node: ExpressionNode): node is Integer | Float { return node instanceof Integer || node instanceof Float }
export function isSignNode(node: ExpressionNode): node is SignNode { return node instanceof SignNode }
export function isListNode(node: ExpressionNode): node is ListNode { return node instanceof ListNode }
export function isFunctionNode(node: ExpressionNode): node is FunctionNode { return node instanceof FunctionNode }
export function isSingleArgumentFunctionNode(node: ExpressionNode): node is SingleArgumentFunctionNode { return node instanceof SingleArgumentFunctionNode }

// Constants and variables.
export function isIntegerNode(node: ExpressionNode): node is Integer { return node instanceof Integer }
export function isFloatNode(node: ExpressionNode): node is Float { return node instanceof Float }
export function isNamedConstant(node: ExpressionNode): node is NamedConstant { return node instanceof NamedConstant }

// Signs.
export function isMinus(node: ExpressionNode): node is Minus { return node instanceof Minus }
export function isPlusMinus(node: ExpressionNode): node is PlusMinus { return node instanceof PlusMinus }

// Variables.
export function isVariable(node: ExpressionNode): node is Variable { return node instanceof Variable }

// Lists.
export function isSum(node: ExpressionNode): node is Sum { return node instanceof Sum }
export function isProduct(node: ExpressionNode): node is Product { return node instanceof Product }

// Functions.
export function isFraction(node: ExpressionNode): node is Fraction { return node instanceof Fraction }
export function isPower(node: ExpressionNode): node is Power { return node instanceof Power }
export function isRoot(node: ExpressionNode): node is Root { return node instanceof Root }
export function isSqrt(node: ExpressionNode): node is Sqrt { return node instanceof Sqrt }
export function isRootLike(node: ExpressionNode): node is RootLike { return isRoot(node) || isSqrt(node) }
export function isLn(node: ExpressionNode): node is Ln { return node instanceof Ln }
export function isLog(node: ExpressionNode): node is Log { return node instanceof Log }
export function isLogLike(node: ExpressionNode): node is LogLike { return isLog(node) || isLn(node) }

// Trigonometry.
export function isSin(node: ExpressionNode): node is Sin { return node instanceof Sin }
export function isCos(node: ExpressionNode): node is Cos { return node instanceof Cos }
export function isTan(node: ExpressionNode): node is Tan { return node instanceof Tan }
export function isArcsin(node: ExpressionNode): node is Arcsin { return node instanceof Arcsin }
export function isArccos(node: ExpressionNode): node is Arccos { return node instanceof Arccos }
export function isArctan(node: ExpressionNode): node is Arctan { return node instanceof Arctan }
export function isTrigonometricFunction(node: ExpressionNode): node is TrigonometricFunction { return isSin(node) || isCos(node) || isTan(node) }
export function isInverseTrigonometricFunction(node: ExpressionNode): node is InverseTrigonometricFunction { return isArcsin(node) || isArccos(node) || isArctan(node) }
export function isTrigonometryLike(node: ExpressionNode): node is TrigonometryLike { return isTrigonometricFunction(node) || isInverseTrigonometricFunction(node) }
