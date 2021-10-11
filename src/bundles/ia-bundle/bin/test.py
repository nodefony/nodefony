#!/usr/bin/env python3

import tensorflow as tf
print(f'tensorflow version : {tf.__version__}')

mnist = tf.keras.datasets.mnist

(x_train, y_train), (x_test, y_test) = mnist.load_data()
x_train, x_test = x_train / 255.0, x_test / 255.0

print (type(x_train) )
print( x_train[:1])


model = tf.keras.models.Sequential([
  tf.keras.layers.Flatten(input_shape=(28, 28)),
  tf.keras.layers.Dense(128, activation='relu'),
  tf.keras.layers.Dropout(0.2),
  tf.keras.layers.Dense(10)
])
print(model)


predictions = model(x_train[:1]).numpy()
print(predictions)
tf.nn.softmax(predictions).numpy()


loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)


model.compile(optimizer='adam',
              loss=loss_fn,
              metrics=['accuracy'])

model.fit(x_train, y_train, epochs=5)


model.evaluate(x_test,  y_test, verbose=2)



probability_model = tf.keras.Sequential([
  model,
  tf.keras.layers.Softmax()
])

probability_model(x_test[:5])





#liste = [1,2,3,4,5,6,7,8,9,10]
#for x in liste:
#    print(f"{x}  sbbob")

#print(liste)
#print(type(liste))*/
